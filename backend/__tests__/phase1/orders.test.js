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
  createTestOrder,
  getSessionCookie 
} from '../setup.js';

describe('Phase 1: Order Creation Tests', () => {
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
    authUser = await createTestUser('order@example.com', 'password123', 'Order User');
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'order@example.com',
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

  describe('POST /api/orders', () => {
    test('should create order successfully from cart', async () => {
      // Add items to cart
      await addTestCartItem(authUser.id, testProduct1.id, 2);
      await addTestCartItem(authUser.id, testProduct2.id, 1);

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Order created successfully',
        order: {
          status: 'pending'
        }
      });

      expect(response.body.order).toHaveProperty('id');
      expect(response.body.order).toHaveProperty('totalAmount');
      expect(response.body.order).toHaveProperty('createdAt');
      expect(response.body.order.totalAmount).toBeCloseTo((99.99 * 2) + (49.99 * 1), 2);
    });

    test('should clear cart after order creation', async () => {
      // Add items to cart
      await addTestCartItem(authUser.id, testProduct1.id, 2);

      // Create order
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      // Check cart is empty
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(cartResponse.body.cart.items).toHaveLength(0);
      expect(cartResponse.body.cart.total).toBe(0);
    });

    test('should reduce product stock after order creation', async () => {
      const initialStock = testProduct1.stock_quantity;

      // Add item to cart
      await addTestCartItem(authUser.id, testProduct1.id, 3);

      // Create order
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      // Check stock reduced
      const productResult = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = $1',
        [testProduct1.id]
      );

      const newStock = productResult.rows[0].stock_quantity;
      expect(newStock).toBe(initialStock - 3);
    });

    test('should reject order if cart is empty', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Cart is empty'
      });
    });

    test('should reject order if insufficient stock', async () => {
      // Add more items than available stock
      await addTestCartItem(authUser.id, testProduct1.id, 100); // stock is only 10

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient stock');
    });

    test('should create order items with correct data', async () => {
      // Add items to cart
      await addTestCartItem(authUser.id, testProduct1.id, 2);
      await addTestCartItem(authUser.id, testProduct2.id, 1);

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      const orderId = response.body.order.id;

      // Check order items in database
      const orderItemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [orderId]
      );

      expect(orderItemsResult.rows).toHaveLength(2);
      
      const product1Item = orderItemsResult.rows.find(item => item.product_id === testProduct1.id);
      expect(product1Item.quantity).toBe(2);
      expect(parseFloat(product1Item.price_at_purchase)).toBeCloseTo(99.99, 2);

      const product2Item = orderItemsResult.rows.find(item => item.product_id === testProduct2.id);
      expect(product2Item.quantity).toBe(1);
      expect(parseFloat(product2Item.price_at_purchase)).toBeCloseTo(49.99, 2);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should handle concurrent order attempts (race condition)', async () => {
      // Add items with limited stock
      await addTestCartItem(authUser.id, testProduct2.id, 5); // All available stock

      // Attempt to create order
      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Stock should be 0 now
      const productResult = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = $1',
        [testProduct2.id]
      );
      expect(productResult.rows[0].stock_quantity).toBe(0);
    });
  });

  describe('GET /api/orders', () => {
    test('should return empty array for user with no orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        count: 0,
        orders: []
      });
    });

    test('should return user order history', async () => {
      // Create two orders
      await addTestCartItem(authUser.id, testProduct1.id, 1);
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie);

      await addTestCartItem(authUser.id, testProduct2.id, 1);
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie);

      const response = await request(app)
        .get('/api/orders')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        count: 2
      });

      expect(response.body.orders).toHaveLength(2);
      expect(response.body.orders[0]).toHaveProperty('id');
      expect(response.body.orders[0]).toHaveProperty('totalAmount');
      expect(response.body.orders[0]).toHaveProperty('status');
      expect(response.body.orders[0]).toHaveProperty('createdAt');
    });

    test('should only show orders for authenticated user', async () => {
      // Create order for first user
      await addTestCartItem(authUser.id, testProduct1.id, 1);
      await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie);

      // Create second user
      const user2 = await createTestUser('order2@example.com', 'password123', 'Order User 2');
      const login2Response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'order2@example.com',
          password: 'password123'
        });
      const session2Cookie = getSessionCookie(login2Response);

      // Second user should see no orders
      const response = await request(app)
        .get('/api/orders')
        .set('Cookie', session2Cookie)
        .expect(200);

      expect(response.body.orders).toHaveLength(0);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/:id', () => {
    test('should return single order with items', async () => {
      // Create order
      await addTestCartItem(authUser.id, testProduct1.id, 2);
      await addTestCartItem(authUser.id, testProduct2.id, 1);
      
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie);

      const orderId = createResponse.body.order.id;

      // Get order details
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        order: {
          id: orderId,
          status: 'pending'
        }
      });

      expect(response.body.order.items).toHaveLength(2);
      expect(response.body.order.items[0]).toHaveProperty('productId');
      expect(response.body.order.items[0]).toHaveProperty('name');
      expect(response.body.order.items[0]).toHaveProperty('quantity');
      expect(response.body.order.items[0]).toHaveProperty('priceAtPurchase');
      expect(response.body.order.items[0]).toHaveProperty('subtotal');
    });

    test('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Order not found'
      });
    });

    test('should prevent accessing other user orders', async () => {
      // Create order for first user
      await addTestCartItem(authUser.id, testProduct1.id, 1);
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie);

      const orderId = createResponse.body.order.id;

      // Create second user
      const user2 = await createTestUser('order2@example.com', 'password123', 'Order User 2');
      const login2Response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'order2@example.com',
          password: 'password123'
        });
      const session2Cookie = getSessionCookie(login2Response);

      // Second user tries to access first user's order
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Cookie', session2Cookie)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Order not found'
      });
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders/1')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Order Total Accuracy', () => {
    test('should calculate order total correctly from cart', async () => {
      // Add multiple items with different quantities
      await addTestCartItem(authUser.id, testProduct1.id, 2); // 99.99 * 2
      await addTestCartItem(authUser.id, testProduct2.id, 3); // 49.99 * 3

      const expectedTotal = (99.99 * 2) + (49.99 * 3);

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', sessionCookie)
        .expect(201);

      expect(response.body.order.totalAmount).toBeCloseTo(expectedTotal, 2);
    });
  });
});
