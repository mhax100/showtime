require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const db_users = require('./users')
const db_events = require('./events')
const db_availabilities = require('./availabilities')
const db_analytics = require('./analytics')
const db_showtimes = require('./showtimes')
const { validateCityAndGetTimezone } = require('./cityValidation')
const { cleanupExpiredData } = require('./cleanup-expired-data')
const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/users', db_users.getUsers)
app.get('/users/:id', db_users.getUserById)
app.post('/users', db_users.createUser)
app.put('/users/:id', db_users.updateUser)
app.delete('/users/:id', db_users.deleteUser)

app.get('/events/', db_events.getEvents)
app.get('/events/:id', db_events.getEventById)
app.post('/events', db_events.createEvent)
app.put('/events/:id', db_events.updateEvent)
app.delete('/events/:id', db_events.deleteEvent)

app.get('/availabilities/', db_availabilities.getAvailabilities)
app.get('/availabilities/:event_id', db_availabilities.getAvailabilityById)
app.get('/availabilities/:event_id/user/:user_id', db_availabilities.getAvailabilityByUserId)
app.post('/availabilities', db_availabilities.createAvailability)
app.put('/availabilities/:event_id', db_availabilities.updateAvailability)
app.delete('/availabilities/:event_id/user/:user_id', db_availabilities.deleteAvailability)

app.get('/analytics/:event_id', db_analytics.getAvailabilitySummary)

app.get('/showtimes/search', db_showtimes.searchShowtimes)
app.post('/showtimes/create/:event_id', db_showtimes.createShowtimes)
app.get('/showtimes/:event_id', db_showtimes.getShowtimesByEvent)

// City validation endpoint
app.post('/validate-city', async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }
    
    const result = await validateCityAndGetTimezone(city);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual cleanup endpoint for testing/admin use
app.post('/admin/cleanup', async (req, res) => {
  try {
    console.log('[API] Manual cleanup requested')
    const result = await cleanupExpiredData()
    res.json({
      message: 'Cleanup completed',
      ...result
    })
  } catch (error) {
    console.error('[API] Manual cleanup failed:', error)
    res.status(500).json({ error: 'Cleanup failed', details: error.message })
  }
});

// Automatic cleanup setup
let cleanupInterval;
const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // Run every 6 hours (in milliseconds)

function startAutomaticCleanup() {
  console.log('[STARTUP] Setting up automatic cleanup every 6 hours')
  
  // Run cleanup immediately on startup (after a short delay)
  setTimeout(async () => {
    console.log('[STARTUP] Running initial cleanup...')
    await cleanupExpiredData()
  }, 30000) // Wait 30 seconds after startup
  
  // Then run every 6 hours
  cleanupInterval = setInterval(async () => {
    console.log('[SCHEDULED] Running automatic cleanup...')
    await cleanupExpiredData()
  }, CLEANUP_INTERVAL)
}

// Only start the server if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`App running on port ${port}.`)
    
    // Start automatic cleanup
    startAutomaticCleanup()
  })
}

module.exports = app
