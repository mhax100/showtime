const Pool = require('pg').Pool
const { validateUUIDs } = require('./helpers')

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'showtime_db',
  password: 'password',
  port: 5432,
})

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const getUserById = (request, response) => {
    const id = request.params.id
    
    // Validate UUID
    const validationError = validateUUIDs({ user_id: id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows[0])
    })
}

const createUser = (request, response) => {
    const { name, email } = request.body
  
    pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).json({
        message: "User created successfully.",
        data: {
          id: results.rows[0].id,
          name: results.rows[0].name,
          email: results.rows[0].email
        },
      });
    })
}

const updateUser = (request, response) => {
    const id = request.params.id
    const { name, email } = request.body
    
    // Validate UUID
    const validationError = validateUUIDs({ user_id: id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name, email, id],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`User modified with ID: ${id}`)
      }
    )
}

const deleteUser = (request, response) => {
    const id = request.params.id
    
    // Validate UUID
    const validationError = validateUUIDs({ user_id: id })
    if (validationError) {
      return response.status(400).json(validationError)
    }
  
    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User deleted with ID: ${id}`)
    })
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}

