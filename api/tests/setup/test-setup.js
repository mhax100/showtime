// Global test setup
require('dotenv').config()

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.SERPAPI_KEY = 'test_key_12345'

// Add timeout for all tests
jest.setTimeout(5000)

// Clean up after all tests
afterAll(async () => {
  // Close any open database connections
  await new Promise(resolve => setTimeout(resolve, 100))
})