const request = require('supertest')
const app = require('../../index')
const mockSerpResponse = require('../../response.json')

// Mock the SerpAPI module to avoid API calls
jest.mock('serpapi', () => ({
  getJson: jest.fn()
}))

const { getJson } = require('serpapi')

describe('Showtimes API Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getJson.mockClear()
  })

  describe('GET /showtimes/search', () => {
    test('should return 400 when missing required parameters', async () => {
      const response = await request(app)
        .get('/showtimes/search')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Missing required parameters')
    })

    test('should return 400 when missing location parameter', async () => {
      const response = await request(app)
        .get('/showtimes/search?movie=F1')
        .expect(400)
      
      expect(response.body.error).toContain('location and movie are required')
    })

    test('should return 400 when missing movie parameter', async () => {
      const response = await request(app)
        .get('/showtimes/search?location=Seattle')
        .expect(400)
      
      expect(response.body.error).toContain('location and movie are required')
    })

    test('should return showtimes data when parameters are correct', async () => {
      // Mock the SerpAPI response - the endpoint returns just the showtimes array
      getJson.mockImplementation((params, callback) => {
        callback(mockSerpResponse)
      })

      const response = await request(app)
        .get('/showtimes/search?location=Seattle,WA&movie=F1')
        .expect(200)
      
      expect(response.body).toBeDefined()
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty('day')
      expect(response.body[0]).toHaveProperty('theaters')
    })
  })

  describe('GET /showtimes/:event_id', () => {
    test('should return 400 when invalid event id is used', async () => {
      const response = await request(app)
        .get('/showtimes/1')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid UUID format for parameter: event_id')
    })
    
    test('should return data when parameters are correct', async () => {
      const response = await request(app)
        .get('/showtimes/4d978926-5d82-4c95-b12d-60209ea5493e')
        .expect(200)
      
      expect(response.body).toBeDefined()
      expect(response.body.showtimes).toBeDefined()
      expect(Array.isArray(response.body.showtimes)).toBe(true)
    })
  })

  describe('POST /showtimes/create/:event_id', () => {
    test('should return 400 when invalid event id is used', async () => {
      const response = await request(app)
        .post('/showtimes/create/1')
        .send({
          location: 'Seattle,WA',
          movie: 'F1',
          duration: 120
        })
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid UUID format for parameter: event_id')
    })
    
    test('should return 400 when missing required body parameters', async () => {
      const response = await request(app)
        .post('/showtimes/create/4d978926-5d82-4c95-b12d-60209ea5493e')
        .send({
          location: 'Seattle,WA',
          movie: 'F1'
          // duration missing
        })
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Missing required parameters')
    })
    
    test('should return data when parameters are correct', async () => {
      // Mock the SerpAPI response for this test too
      getJson.mockImplementation((params, callback) => {
        callback(mockSerpResponse)
      })

      const response = await request(app)
        .post('/showtimes/create/92a7bfd7-71a8-43dc-8e78-5f8335fd787c')
        .send({
          location: 'Seattle,WA',
          movie: 'F1',
          duration: 120
        })
        .expect(201)
      
      expect(response.body).toBeDefined()
      expect(response.body.message).toBeDefined()
      expect(response.body.showtimes).toBeDefined()
      expect(Array.isArray(response.body.showtimes)).toBe(true)
    })
  })
})