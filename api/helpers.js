// Helper functions for validation and utilities

// UUID validation helper
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Validation response helper
const createValidationError = (message) => ({
  error: message
})

// Validate required UUID parameters
const validateUUIDs = (params) => {
  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      return createValidationError(`Missing required parameter: ${key}`)
    }
    if (!isValidUUID(value)) {
      return createValidationError(`Invalid UUID format for parameter: ${key}`)
    }
  }
  return null
}

module.exports = {
  isValidUUID,
  createValidationError,
  validateUUIDs
}