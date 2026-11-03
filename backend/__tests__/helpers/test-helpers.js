import { pool } from '../../src/config/database.js';
import { assertTestDatabase } from './db-guard.js';



export const setupTestDatabase = async () => {
  assertTestDatabase();

  try {
    await pool.query(`
      TRUNCATE TABLE order_items, orders, carts, products, users, session
      RESTART IDENTITY CASCADE
    `);
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
};

export const createTestUser = async (
  email = 'test@example.com',
  password = 'password123',
  name = 'Test User'
) => {
  
  const bcryptModule = await import('bcryptjs');
  const bcrypt = bcryptModule.default ?? bcryptModule;
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
    [email, passwordHash, name]
  );

  return result.rows[0];
};

export const createTestProduct = async (overrides = {}) => {
  const defaults = {
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
    image: 'https://example.com/test.jpg',
    stock_quantity: 10,
    description: 'Test product description',
  };

  const product = { ...defaults, ...overrides };

  const result = await pool.query(
    'INSERT INTO products (name, price, category, image, stock_quantity, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [product.name, product.price, product.category, product.image, product.stock_quantity, product.description]
  );

  return result.rows[0];
};

export const addTestCartItem = async (userId, productId, quantity = 1) => {
  const result = await pool.query(
    'INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
    [userId, productId, quantity]
  );

  return result.rows[0];
};

export const getSessionCookie = (response) => {
  const cookies = response.headers['set-cookie'];
  if (!cookies) return null;

  const sessionCookie = cookies.find((cookie) => cookie.startsWith('connect.sid='));
  return sessionCookie ? sessionCookie.split(';')[0] : null;
};
