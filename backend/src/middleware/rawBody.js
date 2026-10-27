import express from 'express';

/**
 * Raw Body Middleware for Stripe Webhooks
 * 
 * Stripe webhook signature verification requires the raw request body.
 * This middleware captures the raw body before JSON parsing.
 * 
 * IMPORTANT: This must be applied BEFORE express.json() middleware
 * for the webhook route only.
 */
export const rawBodyMiddleware = express.raw({ 
  type: 'application/json',
  verify: (req, res, buf) => {
    // Store the raw body for webhook signature verification
    req.rawBody = buf;
  }
});
