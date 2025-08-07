const pool = require('./database')
const { validateUUIDs } = require('./helpers')

const { calculateAvailabilityPercentages } = require('./analytics')

const getAvailabilities = (request, response) => {
    pool.query('SELECT * FROM event_attendees ORDER BY event_id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const getAvailabilityById = (request, response) => {
    const event_id = request.params.event_id
    
    // Validate UUID
    const validationError = validateUUIDs({ event_id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query('SELECT * FROM event_attendees WHERE event_id = $1', [event_id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const getAvailabilityByUserId = (request, response) => {
    const event_id = request.params.event_id
    const user_id = request.params.user_id
    
    // Validate UUID
    const validationError = validateUUIDs({ event_id, user_id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query('SELECT * FROM event_attendees WHERE event_id = $1  AND user_id = $2', [event_id, user_id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows[0])
    })
}

const createAvailability = (request, response) => {
    const { event_id, user_id, availability, role } = request.body
    pool.query('INSERT INTO event_attendees (event_id, user_id, availability, role) VALUES ($1, $2, $3, $4) RETURNING *', [event_id, user_id, availability, role], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`${results.rows[0].user_id}`)
      
      // Trigger availability summary recalculation
      calculateAvailabilityPercentages(event_id)
    })
}

const updateAvailability = (request, response) => {
    const event_id = request.params.event_id
    const { user_id, availability, role } = request.body
    
    // Validate UUID
    const validationError = validateUUIDs({ event_id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query(
      'UPDATE event_attendees SET availability = $1, role = $2 WHERE event_id = $3 AND user_id = $4',
      [availability, role, event_id, user_id],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`Availability updated for user with ID: ${user_id} for event with ID: ${event_id}`)
        
        // Trigger availability summary recalculation
        calculateAvailabilityPercentages(event_id)
      }
    )
}

const deleteAvailability = (request, response) => {
    const event_id = request.params.event_id
    const user_id = request.params.user_id
    
    // Validate UUID
    const validationError = validateUUIDs({ event_id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query('DELETE FROM event_attendees WHERE event_id = $1 AND user_id = $2', [event_id, user_id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Availability deleted for user with ID: ${user_id} for event with ID: ${event_id}`)
      
      // Trigger availability summary recalculation
      calculateAvailabilityPercentages(event_id)
    }
  )
}

module.exports = {
    getAvailabilities,
    getAvailabilityById,
    getAvailabilityByUserId,
    createAvailability,
    updateAvailability,
    deleteAvailability
}

