import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Service
 * Wrapper for Stripe SDK operations
 */
const stripeService = {
  /**
   * Create a Checkout Session
   * @param {Object} params - Session parameters
   * @returns {Promise<Stripe.Checkout.Session>}
   */
  async createCheckoutSession({
    lineItems,
    orderId,
    userId,
    customerEmail,
    successUrl,
    cancelUrl,
  }) {
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
        client_reference_id: orderId.toString(),
        metadata: {
          order_id: orderId.toString(),
          user_id: userId.toString(),
        },
        // Enable billing address collection
        billing_address_collection: 'required',
        // Collect shipping address for delivery
        shipping_address_collection: {
          allowed_countries: ['SA'], // Saudi Arabia
        },
        // Expire session after 30 minutes
        expires_at: Math.floor(Date.now() / 1000) + 1800,
      });

      return session;
    } catch (error) {
      console.error('Stripe Checkout Session creation error:', error.message);
      throw new Error(`Failed to create Stripe session: ${error.message}`);
    }
  },

  /**
   * Retrieve a Checkout Session
   * @param {string} sessionId - Stripe Session ID
   * @returns {Promise<Stripe.Checkout.Session>}
   */
  async retrieveSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Stripe Session retrieval error:', error.message);
      throw new Error(`Failed to retrieve Stripe session: ${error.message}`);
    }
  },

  /**
   * Construct webhook event from request
   * @param {Buffer} payload - Raw request body
   * @param {string} signature - Stripe signature header
   * @returns {Stripe.Event}
   */
  constructWebhookEvent(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  },

  /**
   * Convert amount to Stripe format (cents)
   * @param {number} amount - Amount in SAR
   * @returns {number} Amount in cents
   */
  toStripeAmount(amount) {
    // Convert to cents and ensure it's an integer
    return Math.round(amount * 100);
  },

  /**
   * Convert Stripe amount to decimal
   * @param {number} amount - Amount in cents
   * @returns {number} Amount in SAR
   */
  fromStripeAmount(amount) {
    return amount / 100;
  },
};

export default stripeService;
