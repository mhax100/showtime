const { getJson } = require('serpapi')
const { calculateShowtimeAvailability } = require('./analytics')
const { parse } = require('date-fns')
const responseData = require('./response.json')
const { validateUUIDs } = require('./helpers')

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'showtime_db',
  password: 'password',
  port: 5432,
})

// serp-api request with caching
const getShowtimes = async (location, movie) => {
  // Check cache first
  const cacheResult = await pool.query(
    'SELECT response_data FROM serpapi_cache WHERE location = $1 AND movie = $2 AND expires_at > NOW()',
    [location, movie]
  )

  if (cacheResult.rows.length > 0) {
    console.log('Using cached SerpAPI data')
    return cacheResult.rows[0].response_data.showtimes
  }

  // Cache miss - fetch from SerpAPI
  console.log('Fetching fresh SerpAPI data')
  return new Promise((resolve, reject) => {
    getJson({
      q: `${movie} theater`,
      location: location,
      hl: "en",
      gl: "us",
      api_key: process.env.SERPAPI_KEY
    }, async (json) => {
      if (json.error) {
        reject(new Error(json.error))
      } else {
        try {
          // Cache the result
          await pool.query(`
            INSERT INTO serpapi_cache (location, movie, response_data, expires_at)
            VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
            ON CONFLICT (location, movie) DO UPDATE SET
              response_data = EXCLUDED.response_data,
              expires_at = EXCLUDED.expires_at,
              created_at = NOW()
          `, [location, movie, json])
          
          resolve(json["showtimes"])
        } catch (cacheError) {
          console.error('Error caching SerpAPI response:', cacheError)
          // Still return the data even if caching fails
          resolve(json["showtimes"])
        }
      }
    })
  })
}

// serp-api request wrapper
const searchShowtimes = async (request, response) => {
  try {
    const { location, movie } = request.query
    
    if (!location || !movie) {
      return response.status(400).json({ 
        error: 'Missing required parameters: location and movie are required' 
      })
    }

    const showtimeData = await getShowtimes(location, movie)
    response.status(200).json(showtimeData)
  } catch (error) {
    console.error('Error in searchShowtimes:', error)
    response.status(500).json({ error: 'Failed to fetch showtimes' })
  }
}

// Main endpoint: Calculate showtimes and save to database
const createShowtimes = async (request, response) => {
  try {
    const { event_id } = request.params
    const { location, movie, duration } = request.body
    
    // Validate UUID
    const validationError = validateUUIDs({ event_id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
    
    if (!event_id || !location || !movie || !duration) {
      return response.status(400).json({ 
        error: 'Missing required parameters: event_id, location, movie, and duration are required' 
      })
    }

    // Get showtimes from SerpAPI (with caching)
    const showtimeData = await getShowtimes(location, movie)
    const showtimes = await extractShowtimes(showtimeData, event_id)
    
    // Calculate availability for each showtime
    const availabilityResults = []
    
    for (const showtime of showtimes) {
      const availability = await calculateShowtimeAvailability(
        event_id, 
        showtime.start_time, 
        parseInt(duration)
      )
      
      if (availability.availability_percentage > 0) {
        availabilityResults.push({
          theater_name: showtime.theater_name,
          theater_address: showtime.theater_address,
          distance: showtime.theater_distance,
          start_time: showtime.start_time,
          showing_type: showtime.showing_type,
          available_users: availability.available_users,
          availability_percentage: availability.availability_percentage,
          required_time_slots: availability.required_time_slots
        })
      }
    }
  
    // Sort by availability percentage (highest first)
    availabilityResults.sort((a, b) => b.availability_percentage - a.availability_percentage)

    // Save to database
    await saveShowtimesToDatabase(event_id, availabilityResults)
    
    response.status(201).json({
      message: `Successfully created and saved ${availabilityResults.length} showtimes for event ${event_id}`,
      showtimes: availabilityResults
    })
    
  } catch (error) {
    console.error('Error in createShowtimes:', error)
    response.status(500).json({ error: 'Failed to create showtimes' })
  }
}

// Helper function to save showtimes to database
const saveShowtimesToDatabase = async (event_id, showtimes) => {
  // Clear existing showtimes for this event
  await pool.query('DELETE FROM movie_showtimes WHERE event_id = $1', [event_id])

  if (showtimes.length === 0) {
    return
  }

  // Prepare bulk insert
  const insertQuery = `
    INSERT INTO movie_showtimes (
      event_id, theater_name, theater_address, distance, 
      start_time, showing_type, available_users, availability_percentage, 
      required_time_slots
    ) VALUES ${showtimes.map((_, i) => `(${Array.from({length: 9}, (_, j) => `$${i*9 + j + 1}`).join(', ')})`).join(', ')}
  `

  const values = showtimes.flatMap(showtime => [
    event_id,
    showtime.theater_name,
    showtime.theater_address,
    showtime.distance,
    showtime.start_time,
    showtime.showing_type,
    showtime.available_users,
    showtime.availability_percentage,
    showtime.required_time_slots
  ])

  await pool.query(insertQuery, values)
}

// Get saved showtimes from database
const getShowtimesByEvent = async (request, response) => {
  try {
    const { event_id } = request.params
    
    // Validate UUID
    const validationError = validateUUIDs({ event_id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
    
    if (!event_id) {
      return response.status(400).json({ 
        error: 'Missing required parameter: event_id' 
      })
    }

    const result = await pool.query(
      'SELECT * FROM movie_showtimes WHERE event_id = $1 ORDER BY availability_percentage DESC, start_time ASC',
      [event_id]
    )

    response.status(200).json({
      event_id: event_id,
      showtimes: result.rows
    })
    
  } catch (error) {
    console.error('Error in getShowtimesByEvent:', error)
    response.status(500).json({ error: 'Failed to retrieve showtimes' })
  }
}


// Helper function to extract showtime data from SerpAPI response
const extractShowtimes = async (serpApiResponse, event_id) => {
  try {
    const showtimes = []

    if (serpApiResponse) {

      // get event metadata
      const eventResults = await pool.query('SELECT * FROM events WHERE id = $1', [event_id])
      const event_data = eventResults.rows[0]

      if (!event_data) {
        console.error(`Event with id ${event_id} not found`)
        return
      }

      serpApiResponse.forEach(dayData => {
        const date = dayData.day // e.g., "TodayJul 8"
        
        dayData.theaters.forEach(theater => {
          if (!event_data.chain || theater.name.includes(event_data.chain)) {
            theater.showing.forEach(showing => {
            showing.time.forEach(time => {
              // Convert time like "5:00pm" to full ISO string
              const showtimeDateTime = convertTimeToISO(time, date)
              
              showtimes.push({
                theater_name: theater.name,
                theater_address: theater.address,
                theater_distance: theater.distance,
                start_time: showtimeDateTime,
                showing_type: showing.type, // "Standard", "IMAX", etc.
                day: date,
                time: time
              })
            })
          })
          }
        })
      })
    }
    
    return showtimes 
  } catch (error) {
    console.error(`Error extracting showtimes for event_id: ${event_id}`, error)
  }
}

// Helper function to convert time format to ISO string
const convertTimeToISO = (timeStr, dayStr) => {
  const formatString = 'MMM d yyyy h:mmaaa'
  
  // Use current date as base date for parsing the time
  const match = dayStr.match(/([A-Za-z]+)([A-Za-z]{3,}\s?\d{1,2})/);
  const dateStr = match[2]
  
  const year = new Date().getFullYear(); // Use current year
  let fullDateStr = `${dateStr} ${year}`; // → "Jul 8 2025"
  fullDateStr += " " + timeStr
  
  const parsedDate = parse(fullDateStr, formatString, new Date());

  return parsedDate.toISOString()
}

module.exports = {
  searchShowtimes,
  createShowtimes,
  getShowtimesByEvent,
  convertTimeToISO
}