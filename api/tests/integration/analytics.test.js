const request = require('supertest')
const app = require('../../index')

describe('Analytics API Integration Tests', () => {
  describe('GET /analytics/:event_id', () => {
    test('should return 404 for non-existent event', async () => {
      // Use a valid UUID format that doesn't exist
      const response = await request(app)
        .get('/analytics/12345678-1234-1234-1234-123456789012')
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('No availability summary data found')
    })

    test('should return 500 for invalid event_id format', async () => {
      const response = await request(app)
        .get('/analytics/invalid')
        .expect(500) // Database will throw an error for invalid UUID
    })
  })
})

// Note: These tests will fail until you have actual data in your database
// You'll need to set up test data or mock the database calls