import stripeService from '../services/stripeService.js';
import orderModel from '../models/orderModel.js';

/**
 * Handle Stripe Webhook Events
 * POST /api/webhooks/stripe
 * 
 * IMPORTANT: This endpoint must receive the RAW request body
 * for signature verification to work correctly.
 */
export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    console.error('❌ Missing Stripe signature header');
    return res.status(400).json({
      success: false,
      message: 'Missing Stripe signature',
    });
  }

  let event;

  try {
    // Construct and verify the webhook event
    // req.rawBody is set by the raw body parser middleware
    event = stripeService.constructWebhookEvent(
      req.rawBody,
      signature
    );
    
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error.message);
    return res.status(400).json({
      success: false,
      message: 'Webhook signature verification failed',
    });
  }

  // Handle the event based on type
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'checkout.session.async_payment_succeeded':
        await handleAsyncPaymentSucceeded(event.data.object);
        break;

      case 'checkout.session.async_payment_failed':
        await handleAsyncPaymentFailed(event.data.object);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of the event
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error(`❌ Error processing webhook event ${event.type}:`, error);
    
    // Return 500 so Stripe will retry the webhook
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message,
    });
  }
};

/**
 * Handle successful checkout session completion
 * This fires when payment is immediately successful (e.g., card payments)
 */
async function handleCheckoutSessionCompleted(session) {
  console.log(`📦 Processing checkout.session.completed for session: ${session.id}`);

  // Only process if payment is successful
  if (session.payment_status !== 'paid') {
    console.log(`⚠️  Payment status is ${session.payment_status}, skipping order completion`);
    return;
  }

  const stripeSessionId = session.id;
  const paymentIntentId = session.payment_intent;

  try {
    // Check if order exists
    const existingOrder = await orderModel.getByStripeSessionId(stripeSessionId);

    if (!existingOrder) {
      console.error(`❌ Order not found for session: ${stripeSessionId}`);
      throw new Error('Order not found for this Stripe session');
    }

    // Check if already processed (idempotency)
    if (existingOrder.payment_status === 'paid') {
      console.log(`ℹ️  Order ${existingOrder.id} already marked as paid, skipping`);
      return;
    }

    // Update order payment status
    const updatedOrder = await orderModel.updatePaymentStatus(
      stripeSessionId,
      'paid',
      paymentIntentId
    );

    console.log(`✅ Payment successful for order #${updatedOrder.id}`);
    console.log(`   - Amount: ${updatedOrder.total_amount} SAR`);
    console.log(`   - Payment Intent: ${paymentIntentId}`);
    console.log(`   - Cart cleared for user #${updatedOrder.user_id}`);

  } catch (error) {
    console.error(`❌ Error updating order for session ${stripeSessionId}:`, error);
    throw error;
  }
}

/**
 * Handle async payment success (e.g., delayed payment methods)
 * Some payment methods like bank transfers complete asynchronously
 */
async function handleAsyncPaymentSucceeded(session) {
  console.log(`📦 Processing async payment success for session: ${session.id}`);

  const stripeSessionId = session.id;
  const paymentIntentId = session.payment_intent;

  try {
    const existingOrder = await orderModel.getByStripeSessionId(stripeSessionId);

    if (!existingOrder) {
      console.error(`❌ Order not found for session: ${stripeSessionId}`);
      throw new Error('Order not found for this Stripe session');
    }

    // Check if already processed
    if (existingOrder.payment_status === 'paid') {
      console.log(`ℹ️  Order ${existingOrder.id} already marked as paid, skipping`);
      return;
    }

    // Update order payment status
    const updatedOrder = await orderModel.updatePaymentStatus(
      stripeSessionId,
      'paid',
      paymentIntentId
    );

    console.log(`✅ Async payment successful for order #${updatedOrder.id}`);

  } catch (error) {
    console.error(`❌ Error updating order for async payment ${stripeSessionId}:`, error);
    throw error;
  }
}

/**
 * Handle async payment failure
 */
async function handleAsyncPaymentFailed(session) {
  console.log(`❌ Processing async payment failure for session: ${session.id}`);

  const stripeSessionId = session.id;

  try {
    const existingOrder = await orderModel.getByStripeSessionId(stripeSessionId);

    if (!existingOrder) {
      console.error(`❌ Order not found for session: ${stripeSessionId}`);
      return;
    }

    // Update order payment status to failed
    await orderModel.updatePaymentStatus(stripeSessionId, 'failed');

    console.log(`⚠️  Payment failed for order #${existingOrder.id}`);

  } catch (error) {
    console.error(`❌ Error updating failed payment for session ${stripeSessionId}:`, error);
    throw error;
  }
}

/**
 * Handle expired checkout session
 * Sessions expire after 24 hours or custom expiration time
 */
async function handleCheckoutSessionExpired(session) {
  console.log(`⏰ Processing expired session: ${session.id}`);

  const stripeSessionId = session.id;

  try {
    const existingOrder = await orderModel.getByStripeSessionId(stripeSessionId);

    if (!existingOrder) {
      console.log(`ℹ️  No order found for expired session: ${stripeSessionId}`);
      return;
    }

    // Only update if still pending
    if (existingOrder.payment_status === 'pending') {
      await orderModel.updatePaymentStatus(stripeSessionId, 'failed');
      console.log(`⏰ Marked order #${existingOrder.id} as failed due to session expiration`);
    }

  } catch (error) {
    console.error(`❌ Error handling expired session ${stripeSessionId}:`, error);
    throw error;
  }
}
