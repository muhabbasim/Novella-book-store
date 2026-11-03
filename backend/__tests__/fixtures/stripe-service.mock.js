/**
 * In-process Stripe stand-in. Tests never call Stripe or create real sessions.
 */
let sessionCounter = 0;

const stripeService = {
  async createCheckoutSession() {
    sessionCounter += 1;
    const id = `cs_test_mock_${sessionCounter}`;
    return {
      id,
      url: `https://checkout.stripe.com/c/pay/${id}`,
    };
  },

  async retrieveSession(sessionId) {
    return {
      id: sessionId,
      payment_status: 'unpaid',
      status: 'open',
    };
  },

  constructWebhookEvent() {
    throw new Error('Webhook mock is not configured for this test');
  },

  toStripeAmount(amount) {
    return Math.round(amount * 100);
  },

  fromStripeAmount(amount) {
    return amount / 100;
  },
};

export default stripeService;
