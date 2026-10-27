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

describe('Phase 1: Cart Functionality Tests', () => {
  let authUser;
  let sessionCookie;
  let testProduct1;
  let testProduct2;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await setupTestDatabase();
    
    // Create test user and login
    authUser = await createTestUser('cart@example.com', 'password123', 'Cart User');
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'cart@example.com',
        password: 'password123'
      });
    
    sessionCookie = getSessionCookie(loginResponse);

    // Create test products
    testProduct1 = await createTestProduct({
      name: 'Product 1',
      price: 99.99,
      stock_quantity: 10
    });

    testProduct2 = await createTestProduct({
      name: 'Product 2',
      price: 49.99,
      stock_quantity: 5
    });
  });

  describe('GET /api/cart', () => {
    test('should return empty cart for new user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        cart: {
          items: [],
          itemCount: 0,
          total: 0
        }
      });
    });

    test('should return cart with items', async () => {
      // Add items to cart
      await addTestCartItem(authUser.id, testProduct1.id, 2);
      await addTestCartItem(authUser.id, testProduct2.id, 1);

      const response = await request(app)
        .get('/api/cart')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cart.items).toHaveLength(2);
      expect(response.body.cart.itemCount).toBe(2);
      expect(response.body.cart.total).toBeGreaterThan(0);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cart')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/cart', () => {
    test('should add item to cart successfully', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct1.id,
          quantity: 2
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Item added to cart'
      });

      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0]).toMatchObject({
        product_id: testProduct1.id,
        quantity: 2
      });
    });

    test('should increment quantity if product already in cart', async () => {
      // Add product first time
      await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct1.id,
          quantity: 2
        });

      // Add same product again
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct1.id,
          quantity: 3
        })
        .expect(201);

      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].quantity).toBe(5); // 2 + 3
    });

    test('should reject adding non-existent product', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: 99999, // Non-existent
          quantity: 1
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Product not found'
      });
    });

    test('should reject adding more than available stock', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct1.id,
          quantity: 100 // More than stock_quantity: 10
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('stock');
    });

    test('should default to quantity 1 if not specified', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct1.id
          // No quantity specified
        })
        .expect(201);

      expect(response.body.cart.items[0].quantity).toBe(1);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/cart')
        .send({
          productId: testProduct1.id,
          quantity: 1
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/cart/:productId', () => {
    beforeEach(async () => {
      // Add item to cart before each update test
      await addTestCartItem(authUser.id, testProduct1.id, 2);
    });

    test('should update item quantity successfully', async () => {
      const response = await request(app)
        .put(`/api/cart/${testProduct1.id}`)
        .set('Cookie', sessionCookie)
        .send({
          quantity: 5
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Cart updated'
      });

      expect(response.body.cart.items[0].quantity).toBe(5);
    });

    test('should reject quantity less than 1', async () => {
      const response = await request(app)
        .put(`/api/cart/${testProduct1.id}`)
        .set('Cookie', sessionCookie)
        .send({
          quantity: 0
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Quantity must be at least 1'
      });
    });

    test('should reject updating to more than available stock', async () => {
      const response = await request(app)
        .put(`/api/cart/${testProduct1.id}`)
        .set('Cookie', sessionCookie)
        .send({
          quantity: 100 // More than stock
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('stock');
    });

    test('should return 404 if product not in cart', async () => {
      const response = await request(app)
        .put(`/api/cart/${testProduct2.id}`) // Not in cart
        .set('Cookie', sessionCookie)
        .send({
          quantity: 2
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Item not found in cart'
      });
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/cart/${testProduct1.id}`)
        .send({
          quantity: 5
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cart/:productId', () => {
    beforeEach(async () => {
      // Add items to cart before each delete test
      await addTestCartItem(authUser.id, testProduct1.id, 2);
      await addTestCartItem(authUser.id, testProduct2.id, 1);
    });

    test('should remove item from cart successfully', async () => {
      const response = await request(app)
        .delete(`/api/cart/${testProduct1.id}`)
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Item removed from cart'
      });

      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].product_id).toBe(testProduct2.id);
    });

    test('should return 404 if product not in cart', async () => {
      const nonExistentProduct = await createTestProduct({
        name: 'Not in cart',
        price: 29.99
      });

      const response = await request(app)
        .delete(`/api/cart/${nonExistentProduct.id}`)
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Item not found in cart'
      });
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/cart/${testProduct1.id}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Cart Total Calculations', () => {
    test('should calculate cart total correctly', async () => {
      // Add multiple items
      await addTestCartItem(authUser.id, testProduct1.id, 2); // 99.99 * 2 = 199.98
      await addTestCartItem(authUser.id, testProduct2.id, 3); // 49.99 * 3 = 149.97

      const response = await request(app)
        .get('/api/cart')
        .set('Cookie', sessionCookie)
        .expect(200);

      const expectedTotal = (99.99 * 2) + (49.99 * 3);
      expect(response.body.cart.total).toBeCloseTo(expectedTotal, 2);
    });
  });

  describe('User Isolation', () => {
    test('users should only see their own cart items', async () => {
      // Add item to first user's cart
      await addTestCartItem(authUser.id, testProduct1.id, 2);

      // Create second user
      const user2 = await createTestUser('cart2@example.com', 'password123', 'Cart User 2');
      const login2Response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'cart2@example.com',
          password: 'password123'
        });
      const session2Cookie = getSessionCookie(login2Response);

      // Second user's cart should be empty
      const response = await request(app)
        .get('/api/cart')
        .set('Cookie', session2Cookie)
        .expect(200);

      expect(response.body.cart.items).toHaveLength(0);
    });
  });
});
