const Pool = require('pg').Pool
const { validateUUIDs } = require('./helpers')

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'showtime_db',
  password: 'password',
  port: 5432,
})

const getEvents = (request, response) => {
    pool.query('SELECT * FROM events ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const getEventById = (request, response) => {
    const id = request.params.id
    
    // Validate UUID
    const validationError = validateUUIDs({ event_id: id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query('SELECT * FROM events WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows[0])
    })
}

const createEvent = (request, response) => {
    const { title, creator_id, location, chain, potential_dates } = request.body
    pool.query('INSERT INTO events (title, creator_id, location, chain, potential_dates) VALUES ($1, $2, $3, $4, $5) RETURNING *', [title, creator_id, location, chain, potential_dates], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`${results.rows[0].id}`)
    })
}

const updateEvent = (request, response) => {
    const id = request.params.id
    const { title, creator_id, location, chain } = request.body
    
    // Validate UUID
    const validationError = validateUUIDs({ event_id: id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query(
      'UPDATE events SET title = $1, creator_id = $2, location = $3, chain = $4 WHERE id = $5',
      [title, creator_id, location, chain, id],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`Event modified with ID: ${id}`)
      }
    )
}

const deleteEvent = (request, response) => {
    const id = request.params.id
    
    // Validate UUID
    const validationError = validateUUIDs({ event_id: id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query('DELETE FROM events WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Event deleted with ID: ${id}`)
    })
}

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
}

