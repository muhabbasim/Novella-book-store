import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './database.js';

const pgSession = connectPgSimple(session);

const sessionConfig = {
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: false // We create it manually in database.js
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

export default sessionConfig;



// connect-pg-simple
// This package allows Express sessions to be stored in PostgreSQL
// connect-pg-simple provides a PostgreSQL-backed session store.
// Its job is to save, retrieve, update, and delete session records in your database.