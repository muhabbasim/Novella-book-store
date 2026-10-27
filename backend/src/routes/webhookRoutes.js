import express from 'express';
import { handleStripeWebhook } from '../controllers/webhookController.js';
import { rawBodyMiddleware } from '../middleware/rawBody.js';

const router = express.Router();

/**
 * @route   POST /api/webhooks/stripe
 * @desc    Handle Stripe webhook events
 * @access  Public (verified by Stripe signature)
 * 
 * IMPORTANT: This route uses rawBodyMiddleware instead of JSON parsing
 * to preserve the raw body for signature verification.
 */
router.post(
  '/stripe',
  rawBodyMiddleware,
  handleStripeWebhook
);

export default router;
