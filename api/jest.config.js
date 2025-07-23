module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    '*.js',
    '!node_modules/**',
    '!tests/**',
    '!jest.config.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/test-setup.js'],
  testTimeout: 10000
}