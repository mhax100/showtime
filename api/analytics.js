const { addMinutes, setHours, setMinutes, isBefore } = require('date-fns')
const { toZonedTime, fromZonedTime } = require('date-fns-tz')
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
      const dateInTimezone = toZonedTime(new Date(date), eventTimezone)
      
      // Start at 9:00 AM in event timezone
      const startInTimezone = setMinutes(setHours(dateInTimezone, 9), 0)
      // End at 12:00 AM the NEXT DAY in event timezone
      const endInTimezone = setMinutes(setHours(dateInTimezone, 24), 0)

      let slotInTimezone = new Date(startInTimezone)
      while (isBefore(slotInTimezone, endInTimezone)) {
        // Convert the timezone slot back to UTC for storage and comparison
        const slotUTC = fromZonedTime(slotInTimezone, eventTimezone)
        const availableUsers = invertedAvailability[slotUTC.toISOString()] || []
        const pct = Math.round((availableUsers.length / totalUsers) * 100)

        availabilitySummary.push({
          event_id,
          time_slot: slotUTC.toISOString(),
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

const calculateShowtimeAvailability = async (event_id, showtime_start, movie_duration_minutes) => {
  try {
    // Calculate required consecutive time slots for the movie
    const startTime = new Date(showtime_start)
    const requiredSlots = []
    let currentSlot = new Date(startTime)
    const endTime = addMinutes(startTime, movie_duration_minutes)

    // Generate all 30-minute slots needed for the movie duration
    while (isBefore(currentSlot, endTime)) {
      requiredSlots.push(currentSlot.toISOString())
      currentSlot = addMinutes(currentSlot, 30)
    }

    // Get pre-calculated availability summary data for the required time slots
    const placeholders = requiredSlots.map((_, i) => `$${i + 2}`).join(', ')
    const summaryQuery = `
      SELECT time_slot, availability_pct, available_user_ids 
      FROM availability_summary 
      WHERE event_id = $1 AND time_slot IN (${placeholders})
    `
    const summaryResults = await pool.query(summaryQuery, [event_id, ...requiredSlots])
    const summaryData = summaryResults.rows

    if (summaryData.length === 0) {
      return {
        available_users: [],
        availability_percentage: 0,
        required_time_slots: requiredSlots,
      }
    }

    // Get total users count from the first summary record
    const totalUsersQuery = await pool.query('SELECT COUNT(*) as total FROM event_attendees WHERE event_id = $1', [event_id])
    const totalUsers = parseInt(totalUsersQuery.rows[0].total)

    // Find users available for ALL required slots (intersection)
    let availableUsers = summaryData[0].available_user_ids || []
    
    for (let i = 1; i < summaryData.length; i++) {
      const usersForSlot = summaryData[i].available_user_ids || []
      availableUsers = availableUsers.filter(userId => usersForSlot.includes(userId))
    }

    const availabilityPercentage = totalUsers > 0 ? Math.round((availableUsers.length / totalUsers) * 100) : 0

    return {
      available_users: availableUsers,
      availability_percentage: availabilityPercentage,
      required_time_slots: requiredSlots
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