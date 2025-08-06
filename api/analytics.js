const { addMinutes, setHours, setMinutes, isBefore, isEqual } = require('date-fns')
const { utcToZonedTime, zonedTimeToUtc } = require('date-fns-tz')
const { validateUUIDs } = require('./helpers')

const pool = require('./database')

const getAvailabilitySummary = (request, response) => {
  const event_id = request.params.event_id
  
  // Validate UUID
  const validationError = validateUUIDs({ event_id })
  if (validationError) {
    return response.status(400).json(validationError)
  }
  
  pool.query('SELECT * FROM availability_summary WHERE event_id = $1', [event_id], (error, results) => {
    if (error) {
      throw error
    }
    
    response.status(200).json(results.rows)
  })
}

const calculateAvailabilityPercentages = async (event_id) => {
  try {
    // get the data for each user for this event from the database
    const userResults = await pool.query('SELECT * FROM event_attendees WHERE event_id = $1', [event_id])
    const user_data = userResults.rows

    // get event metadata
    const eventResults = await pool.query('SELECT * FROM events WHERE id = $1', [event_id])
    const event_data = eventResults.rows[0]

    if (!event_data) {
      console.error(`Event with id ${event_id} not found`)
      return
    }

    // invert data to a map from time slots to user ids available
    const invertedAvailability = {}

    for (const user of user_data) {
      for (const slot of user.availability) {
        // Convert slot to ISO string for consistent key format
        const slotKey = new Date(slot).toISOString()
        if (!invertedAvailability[slotKey]) {
          invertedAvailability[slotKey] = []
        }
        invertedAvailability[slotKey].push(user.user_id)
      }
    }

    // generate summary data
    const availabilitySummary = []
    const totalUsers = user_data.length

    const eventTimezone = event_data.timezone || 'UTC'

    for (const date of event_data.potential_dates) {
      // Convert UTC date to event timezone to create proper 9am-12am range
      const dateInTimezone = utcToZonedTime(new Date(date), eventTimezone)
      
      // Start at 9:00 AM in event timezone
      const startInTimezone = setMinutes(setHours(dateInTimezone, 9), 0)
      // End at 12:00 AM the NEXT DAY in event timezone
      const endInTimezone = setMinutes(setHours(dateInTimezone, 24), 0)

      let slotInTimezone = new Date(startInTimezone)
      while (isBefore(slotInTimezone, endInTimezone)) {
        // Convert the timezone slot back to UTC for storage and comparison
        const slotUTC = zonedTimeToUtc(slotInTimezone, eventTimezone)
        // Ensure slotUTC is rounded to exact 30-minute intervals with no seconds/milliseconds
        const roundedSlotUTC = new Date(slotUTC.getFullYear(), slotUTC.getMonth(), slotUTC.getDate(), 
                                       slotUTC.getHours(), slotUTC.getMinutes(), 0, 0)
        const availableUsers = invertedAvailability[roundedSlotUTC.toISOString()] || []
        const pct = Math.round((availableUsers.length / totalUsers) * 100)

        availabilitySummary.push({
          event_id,
          time_slot: roundedSlotUTC.toISOString(),
          availability_pct: pct,
          available_user_ids: availableUsers,
          updated_at: new Date().toISOString()
        })

        slotInTimezone = addMinutes(slotInTimezone, 30)
      }
    }

    // post the update to the database
    if (availabilitySummary.length > 0) {
      const insertQuery = `
        INSERT INTO availability_summary (event_id, time_slot, availability_pct, available_user_ids, updated_at) 
        VALUES ${availabilitySummary.map((_, i) => `($${i*5+1}, $${i*5+2}, $${i*5+3}, $${i*5+4}, $${i*5+5})`).join(', ')}
        ON CONFLICT (event_id, time_slot) DO UPDATE SET
          availability_pct = EXCLUDED.availability_pct,
          available_user_ids = EXCLUDED.available_user_ids,
          updated_at = EXCLUDED.updated_at
      `

      const values = availabilitySummary.flatMap(item => [
        item.event_id,
        item.time_slot,
        item.availability_pct,
        item.available_user_ids,
        item.updated_at
      ])

      await pool.query(insertQuery, values)
      console.log(`Inserted ${availabilitySummary.length} availability summary records for event ${event_id}`)
    }
  } catch (error) {
    console.error('Error calculating availability percentages:', error)
  }
}

// Helper: round down a date to nearest half hour
function roundDownToHalfHour(date) {
  const ms = date.getTime()
  const minutes = date.getMinutes()
  const roundedMinutes = minutes < 30 ? 0 : 30
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), roundedMinutes, 0, 0)
}

// Helper: round up a date to nearest half hour
function roundUpToHalfHour(date) {
  const minutes = date.getMinutes()
  if (minutes === 0 || minutes === 30) return new Date(date)
  const roundedMinutes = minutes < 30 ? 30 : 60
  let d = new Date(date)
  d.setMinutes(roundedMinutes, 0, 0)
  if (roundedMinutes === 60) {
    d.setHours(d.getHours() + 1)
    d.setMinutes(0)
  }
  return d
}

const calculateShowtimeAvailability = async (event_id, showtime_start, movie_duration_minutes) => {
  try {
    const startTime = new Date(showtime_start)
    const endTime = addMinutes(startTime, movie_duration_minutes)

    // Round start down and end up to nearest half-hour marks to cover all overlapping slots
    const slotRangeStart = roundDownToHalfHour(startTime)
    const slotRangeEnd = roundUpToHalfHour(endTime)

    // Generate all half-hour slots covering this expanded range
    const allSlots = []
    let currentSlot = new Date(slotRangeStart)
    while (isBefore(currentSlot, slotRangeEnd) || isEqual(currentSlot, slotRangeEnd)) {
      allSlots.push(currentSlot.toISOString())
      currentSlot = addMinutes(currentSlot, 30)
    }

    // Query availability for all these slots
    const placeholders = allSlots.map((_, i) => `$${i + 2}`).join(', ')
    const summaryQuery = `
      SELECT time_slot, availability_pct, available_user_ids 
      FROM availability_summary 
      WHERE event_id = $1 AND time_slot IN (${placeholders})
    `
    const summaryResults = await pool.query(summaryQuery, [event_id, ...allSlots])
    const summaryData = summaryResults.rows

    if (summaryData.length === 0) {
      return {
        available_users: [],
        availability_percentage: 0,
        required_time_slots: allSlots,
      }
    }

    // We only want to consider the slots that fully cover the original movie duration:
    // those whose intervals overlap with the [startTime, endTime)
    // Filter summaryData for slots overlapping the original interval:
    const filteredSummary = summaryData.filter(({ time_slot }) => {
      const slotStart = new Date(time_slot)
      const slotEnd = addMinutes(slotStart, 30)
      return slotEnd > startTime && slotStart < endTime
    })

    if (filteredSummary.length === 0) {
      return {
        available_users: [],
        availability_percentage: 0,
        required_time_slots: allSlots,
      }
    }

    // Get total users count
    const totalUsersQuery = await pool.query('SELECT COUNT(*) as total FROM event_attendees WHERE event_id = $1', [event_id])
    const totalUsers = parseInt(totalUsersQuery.rows[0].total)

    // Intersect available_user_ids across all relevant slots
    let availableUsers = filteredSummary[0].available_user_ids || []
    for (let i = 1; i < filteredSummary.length; i++) {
      const usersForSlot = filteredSummary[i].available_user_ids || []
      availableUsers = availableUsers.filter(userId => usersForSlot.includes(userId))
    }

    const availabilityPercentage = totalUsers > 0 ? Math.round((availableUsers.length / totalUsers) * 100) : 0

    return {
      available_users: availableUsers,
      availability_percentage: availabilityPercentage,
      required_time_slots: filteredSummary.map(s => s.time_slot)
    }

  } catch (error) {
    console.error('Error calculating showtime availability:', error)
    throw error
  }
}

module.exports = {
  getAvailabilitySummary,
  calculateAvailabilityPercentages,
  calculateShowtimeAvailability
}