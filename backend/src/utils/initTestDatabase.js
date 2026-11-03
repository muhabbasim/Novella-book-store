import { loadEnv } from '../config/loadEnv.js';

process.env.NODE_ENV = 'test';
loadEnv();

const { assertTestDatabase } = await import('../../__tests__/dbGuard.js');
assertTestDatabase();

const { initializeTables, pool } = await import('../config/database.js');

try {
  await initializeTables();
  console.log('Test database tables are ready');
} finally {
  await pool.end();
}
