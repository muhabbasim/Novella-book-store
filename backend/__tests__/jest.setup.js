import { afterAll } from '@jest/globals';
import { loadEnv } from '../src/config/loadEnv.js';
import { assertTestDatabase } from './helpers/db-guard.js';
import { pool } from '../src/config/database.js';

loadEnv();
assertTestDatabase();

afterAll(async () => {
  await pool.end();
});
