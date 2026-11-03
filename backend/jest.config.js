process.env.NODE_ENV = 'test';

import { loadEnv } from './src/config/loadEnv.js';

loadEnv();

export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^.+/services/stripeService\\.js$': '<rootDir>/__tests__/fixtures/stripe-service.mock.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  globalSetup: '<rootDir>/__tests__/globalSetup.js',
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/utils/seedProducts.js',
    '!src/utils/seedProductionProducts.js',
    '!src/utils/clearProductionProducts.js',
    '!src/utils/initDatabase.js',
    '!src/utils/initTestDatabase.js',
    '!src/utils/createTestDatabase.js',
    '!src/utils/migrateStripe.js',
    '!src/config/loadEnv.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  maxWorkers: 1,
  forceExit: true,
  clearMocks: true,
  testTimeout: 15000,
};
