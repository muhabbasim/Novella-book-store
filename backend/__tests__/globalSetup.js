import { loadEnv } from '../src/config/loadEnv.js';
import { assertTestDatabase } from './helpers/db-guard.js';

export default async function globalSetup() {
  process.env.NODE_ENV = 'test';
  loadEnv();
  assertTestDatabase();

  const { initializeTables, pool } = await import('../src/config/database.js');
  await initializeTables();
  await pool.end();
}
