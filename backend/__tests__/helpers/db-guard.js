const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function getDatabaseName(databaseUrl) {
  const parsed = new URL(databaseUrl);
  return decodeURIComponent(parsed.pathname.replace(/^\//, '')).split('/')[0];
}

/**
 * Refuse destructive test setup unless the target is clearly a test database.
 * Localhost DBs whose name contains "test" are always allowed.
 * Remote hosts (Neon) require ALLOW_REMOTE_TEST_DB=true and a test-named database.
 */
export function assertTestDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Refusing test database setup: NODE_ENV must be "test".');
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is missing. Copy .env.test.example to .env.test, or run npm run test:db:create.'
    );
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('DATABASE_URL is not a valid URL.');
  }

  const dbName = getDatabaseName(url);
  const host = parsed.hostname;
  const nameLooksTest = /test/i.test(dbName);
  const isLocal = LOCAL_HOSTS.has(host);
  const allowRemote = process.env.ALLOW_REMOTE_TEST_DB === 'true';

  if (!nameLooksTest) {
    throw new Error(
      `Refusing to run tests against database "${dbName}". Use a dedicated database named ecommerce_test so development data is never deleted.`
    );
  }

  if (!isLocal && !allowRemote) {
    throw new Error(
      `Refusing to run tests against host "${host}". For a remote test database, set ALLOW_REMOTE_TEST_DB=true in .env.test after creating ecommerce_test.`
    );
  }
}

export function buildTestDatabaseUrl(sourceUrl, testDbName = 'ecommerce_test') {
  const parsed = new URL(sourceUrl);
  parsed.pathname = `/${testDbName}`;
  return parsed.toString();
}