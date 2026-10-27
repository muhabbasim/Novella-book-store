import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { 
  setupTestDatabase, 
  teardownTestDatabase, 
  createTestUser, 
  createTestProduct,
  addTestCartItem,
  getSessionCookie 
} from '../setup.js';

/**
 * CRITICAL TESTS ONLY
 * Fast subset for pre-commit hooks and quick CI checks
 * Runs in ~5 seconds
 */

describe('Phase 1: Critical Path Tests (Fast)', () => {
  let authUser;
  let sessionCookie;
  let testProduct;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await setupTestDatabase();
    
    authUser = await createTestUser('critical@example.com', 'password123', 'Critical User');
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'critical@example.com',
        password: 'password123'
      });
    
    sessionCookie = getSessionCookie(loginResponse);

    testProduct = await createTestProduct({
      name: 'Test Product',
      price: 99.99,
      stock_quantity: 10
    });
  });

  describe('🔐 Authentication - Critical', () => {
    test('should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'SecurePass123!',
          name: 'New User'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('new@example.com');
    });

    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'critical@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'critical@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('🛒 Cart - Critical', () => {
    test('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct.id,
          quantity: 2
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.cart.items).toHaveLength(1);
    });

    test('should prevent adding more than available stock', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct.id,
          quantity: 100
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should update cart quantity', async () => {
      await addTestCartItem(authUser.id, testProduct.id, 2);

      const response = await request(app)
        .put(`/api/cart/${testProduct.id}`)
        .set('Cookie', sessionCookie)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.cart.items[0].quantity).toBe(5);
    });
  });

  describe('📦 Orders - Critical', () => {
    test('should create order from cart', async () => {
      await addTestCartItem(authUser.id, testProduct.id, 2);

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.order).toHaveProperty('id');
    });

    test('should reduce stock after order', async () => {
      const initialStock = testProduct.stock_quantity;
      await addTestCartItem(authUser.id, testProduct.id, 3);

      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      const { pool } = await import('../../src/config/database.js');
      const result = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = $1',
        [testProduct.id]
      );

      expect(result.rows[0].stock_quantity).toBe(initialStock - 3);
    });

    test('should reject empty cart order', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('💳 Payment - Critical', () => {
    test('should create checkout session', async () => {
      await addTestCartItem(authUser.id, testProduct.id, 2);

      const response = await request(app)
        .post('/api/checkout')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('sessionUrl');
    });

    test('should reject checkout with empty cart', async () => {
      const response = await request(app)
        .post('/api/checkout')
        .set('Cookie', sessionCookie)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('📊 Stock - Critical', () => {
    test('should validate stock on cart add', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct.id,
          quantity: 3
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    test('should prevent overselling', async () => {
      await addTestCartItem(authUser.id, testProduct.id, 100);

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(400);

      expect(response.body.message).toContain('Insufficient stock');
    });
  });
});
