import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Load env files. Tests always use `.env.test` (override) so a leftover
 * DATABASE_URL or the development `.env` cannot point at Neon/prod.
 */
export function loadEnv() {
  const isTest = process.env.NODE_ENV === 'test';
  const envPath = path.join(rootDir, isTest ? '.env.test' : '.env');
  const result = dotenv.config({
    path: envPath,
    override: isTest,
  });

  if (isTest && result.error) {
    throw new Error(
      `Could not load ${envPath}. Copy .env.test.example to .env.test and start the test database (npm run test:db:up).`
    );
  }

  return result;
}
