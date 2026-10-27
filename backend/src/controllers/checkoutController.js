import { pool } from '../config/database.js';
import orderModel from '../models/orderModel.js';
import stripeService from '../services/stripeService.js';

/**
 * Create Stripe Checkout Session
 * POST /api/checkout
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get user's cart items from database
    const cartResult = await pool.query(
      `SELECT 
        c.id,
        c.product_id,
        c.quantity,
        p.name,
        p.price,
        p.stock_quantity,
        p.image,
        p.category
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1`,
      [userId]
    );

    const cartItems = cartResult.rows;

    // Validate cart is not empty
    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Validate product availability and stock
    const unavailableProducts = [];
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        unavailableProducts.push({
          name: item.name,
          requested: item.quantity,
          available: item.stock_quantity,
        });
      }
    }

    if (unavailableProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some products are not available in requested quantities',
        unavailableProducts,
      });
    }

    // Calculate total amount using SERVER-SIDE prices (security critical)
    let totalAmount = 0;
    const lineItems = [];

    for (const item of cartItems) {
      // Parse price from database (may be stored as string)
      const unitPrice = typeof item.price === 'string' 
        ? parseFloat(item.price) 
        : item.price;
      
      const lineTotal = unitPrice * item.quantity;
      totalAmount += lineTotal;

      // Prepare Stripe line items
      lineItems.push({
        price_data: {
          currency: 'sar',
          product_data: {
            name: item.name,
            description: item.category,
            images: item.image ? [item.image] : [],
          },
          unit_amount: stripeService.toStripeAmount(unitPrice),
        },
        quantity: item.quantity,
      });
    }

    // Round total to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Get user email
    const userResult = await pool.query(
      'SELECT email, name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Create Stripe Checkout Session first to get session ID
    const frontendUrl = process.env.FRONTEND_URL;
    
    // Create a temporary session to get the ID
    const tempSession = await stripeService.createCheckoutSession({
      lineItems,
      orderId: 0, // Temporary, will update in metadata
      userId,
      customerEmail: user.email,
      successUrl: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/checkout/cancel`,
    });

    // Create pending order in database with Stripe session ID
    const order = await orderModel.createPendingOrder(
      userId,
      totalAmount,
      tempSession.id
    );

    // Add order items
    const orderItems = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    }));

    await orderModel.addOrderItems(order.id, orderItems);

    // Return session URL to frontend
    return res.status(200).json({
      success: true,
      sessionId: tempSession.id,
      sessionUrl: tempSession.url,
      orderId: order.id,
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message,
    });
  }
};

/**
 * Get checkout status by session ID
 * GET /api/checkout/status?session_id=xxx
 */
export const getCheckoutStatus = async (req, res) => {
  try {
    const { session_id } = req.query;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    // Get order from database by session ID
    const order = await orderModel.getByStripeSessionId(session_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify order belongs to the authenticated user
    if (order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order',
      });
    }

    // Return order status from database only
    // Webhook should update this when payment completes
    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.payment_status,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
      },
    });

  } catch (error) {
    console.error('Checkout status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve checkout status',
      error: error.message,
    });
  }
};
