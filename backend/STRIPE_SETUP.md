# Stripe Integration Setup Guide

## Prerequisites

1. **Stripe Account** (Test Mode)
   - Sign up at https://stripe.com
   - Get your test API keys from Dashboard

2. **Stripe CLI** (for webhook testing)
   - Install: https://stripe.com/docs/stripe-cli
   - Required for local webhook forwarding

---

## Step 1: Configure Environment Variables

Update your `backend/.env` file:

```env
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
```

### Where to find these keys:

**STRIPE_SECRET_KEY:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your "Secret key" (starts with `sk_test_`)
3. ⚠️ **Never commit this to Git or expose in frontend**

**STRIPE_WEBHOOK_SECRET:**
- You'll get this in Step 3 when configuring webhooks

---

## Step 2: Install Dependencies

Stripe SDK is already included in package.json:

```bash
cd backend
npm install
```

---

## Step 3: Set Up Stripe Webhooks (Local Development)

### Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Other platforms:**
https://stripe.com/docs/stripe-cli#install

### Login to Stripe

```bash
stripe login
```

This will open your browser to authorize the CLI.

### Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:5001/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy this webhook secret** and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

**Keep this terminal running** while testing - it forwards Stripe events to your local server.

---

## Step 4: Start the Backend Server

In a new terminal:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Database tables initialized successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
║   🚀 Server running on port 5001        ║
║   📍 API: http://localhost:5001         ║
```

---

## Step 5: Test the Checkout Endpoint

### 1. Login as a user (to get session cookie)

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt
```

### 2. Add items to cart

```bash
curl -X POST http://localhost:5001/api/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productId": 1, "quantity": 2}'
```

### 3. Create checkout session

```bash
curl -X POST http://localhost:5001/api/checkout \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_xxxxxxxxxxxxx",
  "sessionUrl": "https://checkout.stripe.com/c/pay/cs_test_xxxxxxxxxxxxx",
  "orderId": 123
}
```

### 4. Test the session URL

Copy the `sessionUrl` from the response and open it in your browser. You'll see the Stripe Checkout page.

**Use Stripe test card:**
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

---

## Step 6: Verify Webhook Processing

After completing payment in Stripe Checkout:

1. Check the **Stripe CLI terminal** - you should see:
   ```
   --> checkout.session.completed [evt_xxxxx]
   <-- [200] POST http://localhost:5001/api/webhooks/stripe
   ```

2. Check your **server logs** for:
   ```
   ✅ Webhook verified: checkout.session.completed
   ✅ Payment successful for order #123
   ```

3. Verify in database:
   ```bash
   # Check order payment status
   psql $DATABASE_URL -c "SELECT id, payment_status, stripe_session_id FROM orders WHERE id = 123;"
   ```

   Should show:
   ```
    id | payment_status |     stripe_session_id
   ----+----------------+---------------------------
   123 | paid           | cs_test_xxxxxxxxxxxxx
   ```

---

## Testing Different Payment Scenarios

### Successful Payment
Card: `4242 4242 4242 4242`
- Payment succeeds
- Webhook fires `checkout.session.completed`
- Order status updated to `paid`

### Declined Payment
Card: `4000 0000 0000 0002`
- Payment declined
- User can retry with different card

### Insufficient Funds
Card: `4000 0000 0000 9995`
- Payment fails with insufficient funds

### More test cards:**
https://stripe.com/docs/testing#cards

---

## API Endpoints Summary

### Checkout Endpoint
```
POST /api/checkout
Authorization: Required (session cookie)
```

Creates a Stripe Checkout Session for the user's cart.

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "sessionUrl": "https://checkout.stripe.com/...",
  "orderId": 123
}
```

### Checkout Status Endpoint
```
GET /api/checkout/status?session_id=cs_test_xxxxx
Authorization: Required (session cookie)
```

Retrieves order and payment status.

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 123,
    "status": "completed",
    "paymentStatus": "paid",
    "totalAmount": "150.00",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "stripeStatus": "paid"
}
```

---

## Troubleshooting

### Error: "Stripe secret key not configured"
- Ensure `STRIPE_SECRET_KEY` is set in `.env`
- Restart the server after updating `.env`

### Error: "Webhook signature verification failed"
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:5001/api/webhooks/stripe`
- Copy the webhook secret from CLI output to `.env`
- Restart the server

### Checkout session not creating
- Verify user is logged in (has valid session)
- Check cart has items: `GET /api/cart`
- Check server logs for detailed error

### Webhook not firing
- Ensure Stripe CLI is running and forwarding
- Check webhook endpoint is accessible: `POST /api/webhooks/stripe`
- Verify webhook secret matches between CLI and `.env`

---

## Production Deployment

### On Railway (or your production host):

1. **Set environment variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx  # Use LIVE key in production
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

2. **Create webhook in Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-api-domain.railway.app/api/webhooks/stripe`
   - Events to send: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

3. **Switch to live mode:**
   - Get live API keys from Stripe Dashboard
   - Update environment variables
   - Test with real cards (not test cards)

⚠️ **Important:** Test thoroughly in test mode before switching to live mode!

---

## Security Checklist

- ✅ Never expose `STRIPE_SECRET_KEY` in frontend code
- ✅ Never expose `STRIPE_WEBHOOK_SECRET` in version control
- ✅ Always calculate prices on the server (never trust frontend)
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Validate user authentication before checkout
- ✅ Check product availability and stock before creating session

---

## Next Steps

After webhook handler is complete, you'll be able to:
1. ✅ Create checkout sessions
2. ✅ Redirect to Stripe hosted payment page
3. ✅ Receive webhook notifications on payment success
4. ✅ Update order status automatically
5. ✅ Clear cart after successful payment

**Ready for Step 3:** Webhook Handler Implementation
