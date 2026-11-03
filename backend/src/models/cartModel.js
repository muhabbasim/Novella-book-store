import { pool } from '../config/database.js';

const cartModel = {
  // Get user's cart with product details
  async getByUserId(userId) {
    const result = await pool.query(
      `SELECT 
        c.id,
        c.user_id,
        c.product_id,
        c.quantity,
        c.created_at,
        c.updated_at,
        p.name,
        p.price,
        p.category,
        p.image,
        p.stock_quantity,
        (p.price * c.quantity) as subtotal
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get specific cart item
  async getCartItem(userId, productId) {
    const result = await pool.query(
      `SELECT * FROM carts 
       WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    return result.rows[0];
  },

  // Add item to cart (or update if exists)
  async addItem(userId, productId, quantity) {
    const result = await pool.query(
      `INSERT INTO carts (user_id, product_id, quantity) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET 
         quantity = carts.quantity + $3,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, productId, quantity]
    );
    return result.rows[0];
  },

  // Update item quantity
  async updateQuantity(userId, productId, quantity) {
    const result = await pool.query(
      `UPDATE carts 
       SET quantity = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND product_id = $2 
       RETURNING *`,
      [userId, productId, quantity]
    );
    return result.rows[0];
  },

  // Remove item from cart
  async removeItem(userId, productId) {
    const result = await pool.query(
      'DELETE FROM carts WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );
    return result.rows[0];
  },

  // Clear user's cart
  async clearCart(userId) {
    await pool.query(
      'DELETE FROM carts WHERE user_id = $1',
      [userId]
    );
  },

  // Get cart total
  async getCartTotal(userId) {
    const result = await pool.query(
      `SELECT COALESCE(SUM(p.price * c.quantity), 0) as total
       FROM carts c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );
    return parseFloat(result.rows[0].total);
  }
};

export default cartModel;
