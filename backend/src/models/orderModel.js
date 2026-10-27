import { pool } from '../config/database.js';

const orderModel = {
  // Create order with items (transaction) - for Cash on Delivery or immediate payment
  async create(userId, totalAmount, cartItems) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, total_amount, status, payment_status) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, totalAmount, 'completed', 'paid']
      );
      const order = orderResult.rows[0];

      // Create order items
      for (const item of cartItems) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
          [order.id, item.product_id, item.quantity, item.price]
        );

        // Update product stock
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Clear user's cart
      await client.query('DELETE FROM carts WHERE user_id = $1', [userId]);

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get user's orders
  async getByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  // Get order by ID with items
  async getById(orderId, userId) {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // Get order items with product details
    const itemsResult = await pool.query(
      `SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price_at_purchase,
        p.name,
        p.image,
        p.category,
        (oi.price_at_purchase * oi.quantity) as subtotal
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`,
      [orderId]
    );

    order.items = itemsResult.rows;
    return order;
  },

  // Update order status
  async updateStatus(orderId, status) {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    return result.rows[0];
  },

  // Create pending order for Stripe Checkout (without clearing cart yet)
  async createPendingOrder(userId, totalAmount, stripeSessionId) {
    const result = await pool.query(
      `INSERT INTO orders (user_id, total_amount, status, payment_status, stripe_session_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, totalAmount, 'pending', 'pending', stripeSessionId]
    );
    return result.rows[0];
  },

  // Add order items to an existing order
  async addOrderItems(orderId, cartItems) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of cartItems) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Update order payment status after Stripe webhook
  async updatePaymentStatus(stripeSessionId, paymentStatus, stripePaymentIntentId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update order payment status
      const updateQuery = stripePaymentIntentId
        ? `UPDATE orders 
           SET payment_status = $1, stripe_payment_intent_id = $2, status = $3 
           WHERE stripe_session_id = $4 
           RETURNING *`
        : `UPDATE orders 
           SET payment_status = $1, status = $2 
           WHERE stripe_session_id = $3 
           RETURNING *`;

      const updateParams = stripePaymentIntentId
        ? [paymentStatus, stripePaymentIntentId, paymentStatus === 'paid' ? 'completed' : 'pending', stripeSessionId]
        : [paymentStatus, paymentStatus === 'paid' ? 'completed' : 'pending', stripeSessionId];

      const orderResult = await client.query(updateQuery, updateParams);

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found for this Stripe session');
      }

      const order = orderResult.rows[0];

      // If payment is successful, update product stock and clear cart
      if (paymentStatus === 'paid') {
        // Get order items to update stock
        const itemsResult = await client.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
          [order.id]
        );

        // Update product stock
        for (const item of itemsResult.rows) {
          await client.query(
            'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }

        // Clear user's cart
        await client.query('DELETE FROM carts WHERE user_id = $1', [order.user_id]);
      }

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get order by Stripe session ID
  async getByStripeSessionId(stripeSessionId) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE stripe_session_id = $1',
      [stripeSessionId]
    );
    return result.rows[0] || null;
  }
};

export default orderModel;
