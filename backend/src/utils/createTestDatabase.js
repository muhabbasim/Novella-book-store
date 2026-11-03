import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pkg from 'pg';
import { assertTestDatabase, buildTestDatabaseUrl } from '../../__tests__/helpers/db-guard.js';

const { Client } = pkg;
const TEST_DB_NAME = 'ecommerce_test';
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

dotenv.config({ path: path.join(rootDir, '.env') });

const sourceUrl = process.env.DATABASE_URL;
if (!sourceUrl) {
  throw new Error('DATABASE_URL is missing from .env. Needed only to CREATE DATABASE ecommerce_test.');
}

const source = new URL(sourceUrl);
const sourceDb = decodeURIComponent(source.pathname.replace(/^\//, '')).split('/')[0];
if (/test/i.test(sourceDb)) {
  throw new Error(
    `Refusing to create a test database from "${sourceDb}". Run this against your development database URL in .env.`
  );
}

function withoutPooler(urlString) {
  const parsed = new URL(urlString);
  parsed.hostname = parsed.hostname.replace('-pooler', '');
  return parsed.toString();
}

const testUrl = buildTestDatabaseUrl(sourceUrl, TEST_DB_NAME);
const adminUrl = withoutPooler(sourceUrl);
const needsSsl = !['localhost', '127.0.0.1'].includes(new URL(adminUrl).hostname);
const admin = new Client({
  connectionString: adminUrl,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

await admin.connect();

try {
  const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB_NAME]);
  if (existing.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${TEST_DB_NAME}`);
    console.log(`Created database ${TEST_DB_NAME} on ${source.hostname}`);
  } else {
    console.log(`Database ${TEST_DB_NAME} already exists on ${source.hostname}`);
  }
} finally {
  await admin.end();
}

const envTestPath = path.join(rootDir, '.env.test');
const envTestContents = `NODE_ENV=test

# Dedicated test database — never point this at neondb / production
DATABASE_URL=${testUrl}
ALLOW_REMOTE_TEST_DB=true

SESSION_SECRET=test_session_secret_not_for_production
STRIPE_SECRET_KEY=sk_test_mock
STRIPE_WEBHOOK_SECRET=whsec_test_mock
FRONTEND_URL=http://localhost:5173
PORT=5001
`;

fs.writeFileSync(envTestPath, envTestContents);
console.log('Wrote .env.test (gitignored) pointing at ecommerce_test');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testUrl;
process.env.ALLOW_REMOTE_TEST_DB = 'true';
assertTestDatabase();

const { initializeTables, pool } = await import('../config/database.js');
try {
  await initializeTables();
  console.log('Test tables are ready. Development data was not modified.');
} finally {
  await pool.end();
}
