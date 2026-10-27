import { pool } from '../src/config/database.js';

// Setup runs before all tests
export const setupTestDatabase = async () => {
  try {
    // Clear all test data
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM carts');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM session');

    console.log('✅ Test database cleared');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
};

// Cleanup runs after all tests
export const teardownTestDatabase = async () => {
  try {
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Failed to teardown test database:', error);
  }
};

// Create test user
export const createTestUser = async (email = 'test@example.com', password = 'password123', name = 'Test User') => {
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
    [email, passwordHash, name]
  );
  
  return result.rows[0];
};

// Create test product
export const createTestProduct = async (overrides = {}) => {
  const defaults = {
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
    image: 'https://example.com/test.jpg',
    stock_quantity: 10,
    description: 'Test product description'
  };
  
  const product = { ...defaults, ...overrides };
  
  const result = await pool.query(
    'INSERT INTO products (name, price, category, image, stock_quantity, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [product.name, product.price, product.category, product.image, product.stock_quantity, product.description]
  );
  
  return result.rows[0];
};

// Create test order
export const createTestOrder = async (userId, total = 199.98, status = 'pending') => {
  const result = await pool.query(
    'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
    [userId, total, status]
  );
  
  return result.rows[0];
};

// Add item to test cart
export const addTestCartItem = async (userId, productId, quantity = 1) => {
  const result = await pool.query(
    'INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
    [userId, productId, quantity]
  );
  
  return result.rows[0];
};

// Get session cookie from login response
export const getSessionCookie = (response) => {
  const cookies = response.headers['set-cookie'];
  if (!cookies) return null;
  
  const sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid='));
  return sessionCookie ? sessionCookie.split(';')[0] : null;
};
