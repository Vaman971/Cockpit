/**
 * Jest configuration for BluebirdCockpit API
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/middleware/**/*.js',
    'src/models/**/*.js',
    '!src/models/sync.js',
    'src/utils/**/*.js',
    '!src/utils/logger.js', // logger is a side-effect module
  ],
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  // Allow up to 10 seconds per test (DB mocks can be slow to set up)
  testTimeout: 10000,
  // Suppress logger noise during tests
  setupFiles: ['<rootDir>/src/__tests__/setup.js'],
  // Clear mocks automatically between tests
  clearMocks: true,
  restoreMocks: true,
};
