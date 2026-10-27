# Stripe Webhook Setup Guide

## The Problem

When testing Stripe Checkout locally, the webhook events (like `checkout.session.completed`) are sent to Stripe's servers, but they don't automatically reach your local development server at `localhost:5001`. This means:

- ✅ Payments process successfully in Stripe
- ❌ Your local database never gets updated
- ❌ Order status stays "pending" forever

## The Solution: Stripe CLI

Stripe CLI creates a tunnel between Stripe and your local server, forwarding webhook events in real-time.

---

## Step 1: Install Stripe CLI

### macOS (using Homebrew):
```bash
brew install stripe/stripe-cli/stripe
```

### Alternative (download binary):
Visit: https://stripe.com/docs/stripe-cli#install

---

## Step 2: Login to Stripe

```bash
stripe login
```

This opens your browser to authenticate with your Stripe account.

---

## Step 3: Forward Webhooks to Local Server

**Important:** Keep this terminal running while testing!

```bash
stripe listen --forward-to localhost:5001/api/webhooks/stripe --all-thin

```

This command will:
1. Create a webhook endpoint ID
2. Display your webhook signing secret (starts with `whsec_`)
3. Forward all Stripe events to your local server

Example output:
```
> Ready! You are using Stripe API Version [2024-10-28]. Your webhook signing secret is whsec_xxx (^C to quit)
```

---

## Step 4: Update Your .env File

Copy the webhook signing secret from the terminal output and update your backend `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_new_secret_here
```

**Note:** Don't restart your backend server - it will pick up the new secret automatically when processing webhooks.

---

## Step 5: Test the Complete Flow

1. Keep the Stripe CLI running (`stripe listen...`)
2. Make sure your backend is running (`npm run dev`)
3. Make sure your frontend is running
4. Add items to cart
5. Proceed to checkout
6. Complete payment with test card: `4242 4242 4242 4242`
7. Watch the Stripe CLI terminal - you should see webhook events being forwarded

Expected webhook events:
```
checkout.session.completed [evt_xxx]
```

Your backend logs should show:
```
✅ Webhook verified: checkout.session.completed
📦 Processing checkout.session.completed for session: cs_xxx
✅ Payment successful for order #X
```

---

## Step 6: Verify Success

After payment:
- Order status should be "confirmed"  
- Payment status should be "paid"
- Cart should be cleared
- Success page should show immediately

---

## For Production Deployment

When deploying to production (Railway, Vercel, etc.):

1. **Add webhook endpoint in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-production-domain.com/api/webhooks/stripe`
   - Events to send: 
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`

2. **Copy the webhook signing secret** from the dashboard

3. **Update your production environment variables:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
   ```

---

## Testing Without Stripe CLI (Workaround)

If you can't install Stripe CLI right now, the current code includes a fallback:

- The checkout status endpoint automatically syncs from Stripe
- When the success page checks order status, it queries Stripe directly
- If Stripe says "paid", it updates the database automatically

**However:** This is a workaround. The proper solution is using webhooks with Stripe CLI.

---

## Troubleshooting

### Webhook not receiving events:
```bash
# Check if Stripe CLI is running
stripe listen --forward-to localhost:5001/api/webhooks/stripe

# Test webhook manually
stripe trigger checkout.session.completed
```

### Signature verification failed:
- Make sure you copied the correct `whsec_` secret from Stripe CLI
- Update `.env` file with the new secret
- The secret from CLI is different from the one in Dashboard

### Backend not receiving webhooks:
- Ensure backend is running on port 5001
- Check firewall settings
- Verify the webhook route: `POST http://localhost:5001/api/webhooks/stripe`

---

## Quick Start Commands

```bash
# Terminal 1: Start Stripe webhook forwarding
stripe listen --forward-to localhost:5001/api/webhooks/stripe

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend  
npm run dev
```

Now test the complete checkout flow!
