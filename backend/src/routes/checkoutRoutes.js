import express from 'express';
import { createCheckoutSession, getCheckoutStatus } from '../controllers/checkoutController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/checkout
 * @desc    Create Stripe Checkout Session
 * @access  Private (requires authentication)
 */
router.post('/', requireAuth, createCheckoutSession);

/**
 * @route   GET /api/checkout/status
 * @desc    Get order status by Stripe session ID
 * @access  Private (requires authentication)
 */
router.get('/status', requireAuth, getCheckoutStatus);

export default router;
