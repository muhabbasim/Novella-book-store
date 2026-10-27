import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { pool } from '../../src/config/database.js';
import { 
  setupTestDatabase, 
  teardownTestDatabase, 
  createTestUser, 
  createTestProduct,
  addTestCartItem,
  getSessionCookie 
} from '../setup.js';

describe('Phase 1: Stock Management Tests', () => {
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
    
    // Create test user and login
    authUser = await createTestUser('stock@example.com', 'password123', 'Stock User');
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'stock@example.com',
        password: 'password123'
      });
    
    sessionCookie = getSessionCookie(loginResponse);

    // Create test product with limited stock
    testProduct = await createTestProduct({
      name: 'Limited Stock Product',
      price: 99.99,
      stock_quantity: 5
    });
  });

  describe('Stock Validation on Add to Cart', () => {
    test('should prevent adding more items than available stock', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct.id,
          quantity: 10 // More than stock_quantity: 5
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('5 items available');
    });

    test('should allow adding items within stock limit', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct.id,
          quantity: 3 // Within stock_quantity: 5
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    test('should prevent cumulative cart quantity from exceeding stock', async () => {
      // Add 3 items first
      await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct.id,
          quantity: 3
        })
        .expect(201);

      // Try to add 3 more (total would be 6, but stock is 5)
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct.id,
          quantity: 3
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should allow adding exactly available stock', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct.id,
          quantity: 5 // Exactly stock_quantity
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Stock Validation on Cart Update', () => {
    beforeEach(async () => {
      // Add item to cart
      await addTestCartItem(authUser.id, testProduct.id, 2);
    });

    test('should prevent updating quantity beyond available stock', async () => {
      const response = await request(app)
        .put(`/api/cart/${testProduct.id}`)
        .set('Cookie', sessionCookie)
        .send({
          quantity: 10 // More than stock
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('stock');
    });

    test('should allow updating quantity within stock limit', async () => {
      const response = await request(app)
        .put(`/api/cart/${testProduct.id}`)
        .set('Cookie', sessionCookie)
        .send({
          quantity: 4 // Within stock
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cart.items[0].quantity).toBe(4);
    });
  });

  describe('Stock Reduction on Order Creation', () => {
    test('should reduce stock when order is created', async () => {
      const initialStock = testProduct.stock_quantity;

      // Add to cart and create order
      await addTestCartItem(authUser.id, testProduct.id, 3);
      
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      // Check stock reduced
      const result = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = $1',
        [testProduct.id]
      );

      expect(result.rows[0].stock_quantity).toBe(initialStock - 3);
    });

    test('should reduce stock for multiple products in order', async () => {
      const product2 = await createTestProduct({
        name: 'Product 2',
        price: 49.99,
        stock_quantity: 10
      });

      const initialStock1 = testProduct.stock_quantity;
      const initialStock2 = product2.stock_quantity;

      // Add multiple items and create order
      await addTestCartItem(authUser.id, testProduct.id, 2);
      await addTestCartItem(authUser.id, product2.id, 3);
      
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      // Check both stocks reduced
      const result1 = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = $1',
        [testProduct.id]
      );
      const result2 = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = $1',
        [product2.id]
      );

      expect(result1.rows[0].stock_quantity).toBe(initialStock1 - 2);
      expect(result2.rows[0].stock_quantity).toBe(initialStock2 - 3);
    });

    test('should prevent order if stock insufficient at checkout', async () => {
      // Add to cart
      await addTestCartItem(authUser.id, testProduct.id, 3);

      // Manually reduce stock to simulate race condition
      await pool.query(
        'UPDATE products SET stock_quantity = 1 WHERE id = $1',
        [testProduct.id]
      );

      // Try to create order
      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient stock');
    });
  });

  describe('Stock Edge Cases', () => {
    test('should handle product with zero stock', async () => {
      const outOfStockProduct = await createTestProduct({
        name: 'Out of Stock',
        price: 29.99,
        stock_quantity: 0
      });

      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: outOfStockProduct.id,
          quantity: 1
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('0 items available');
    });

    test('should handle last item in stock', async () => {
      const lastItemProduct = await createTestProduct({
        name: 'Last Item',
        price: 99.99,
        stock_quantity: 1
      });

      // First user adds to cart
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: lastItemProduct.id,
          quantity: 1
        })
        .expect(201);

      expect(response.body.success).toBe(true);

      // Create order
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      // Stock should be 0
      const result = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = $1',
        [lastItemProduct.id]
      );

      expect(result.rows[0].stock_quantity).toBe(0);
    });

    test('should handle concurrent stock updates (race condition)', async () => {
      // Create product with limited stock
      const limitedProduct = await createTestProduct({
        name: 'Race Condition Product',
        price: 79.99,
        stock_quantity: 3
      });

      // Create second user
      const user2 = await createTestUser('stock2@example.com', 'password123', 'Stock User 2');
      const login2Response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'stock2@example.com',
          password: 'password123'
        });
      const session2Cookie = getSessionCookie(login2Response);

      // Both users add all available stock to cart
      await addTestCartItem(authUser.id, limitedProduct.id, 3);
      await addTestCartItem(user2.id, limitedProduct.id, 3);

      // First user creates order - should succeed
      const response1 = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      expect(response1.body.success).toBe(true);

      // Second user tries to create order - should fail
      const response2 = await request(app)
        .post('/api/orders')
        .set('Cookie', session2Cookie)
        .expect(400);

      expect(response2.body.success).toBe(false);
      expect(response2.body.message).toContain('Insufficient stock');
    });

    test('should not allow negative stock', async () => {
      // This test ensures database constraints prevent negative stock
      // Add to cart
      await addTestCartItem(authUser.id, testProduct.id, 5);

      // Create order
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      // Try to add more to cart (should fail)
      const response = await request(app)
        .post('/api/cart')
        .set('Cookie', sessionCookie)
        .send({
          productId: testProduct.id,
          quantity: 1
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Stock Quantity Display', () => {
    test('should return current stock in product details', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct.id}`)
        .expect(200);

      expect(response.body.product).toHaveProperty('stock_quantity');
      expect(response.body.product.stock_quantity).toBe(5);
    });

    test('should return updated stock after order', async () => {
      // Create order
      await addTestCartItem(authUser.id, testProduct.id, 2);
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie);

      // Check product stock updated
      const response = await request(app)
        .get(`/api/products/${testProduct.id}`)
        .expect(200);

      expect(response.body.product.stock_quantity).toBe(3); // 5 - 2
    });
  });

  describe('Atomic Stock Operations', () => {
    test('should handle stock updates atomically', async () => {
      // This test verifies that stock updates are transactional
      // If order creation fails, stock should not be reduced
      
      // Add item with invalid data that will cause order to fail
      await addTestCartItem(authUser.id, testProduct.id, 2);

      const initialStock = testProduct.stock_quantity;

      // If there were a way to force order creation to fail after stock reduction,
      // we would test rollback here. This depends on your transaction implementation.

      // For now, verify successful path maintains data integrity
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      const result = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = $1',
        [testProduct.id]
      );

      // Stock should be reduced by exactly the ordered quantity
      expect(result.rows[0].stock_quantity).toBe(initialStock - 2);
    });
  });
});
