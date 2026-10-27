# Stripe Webhook Testing Guide

## Overview

Webhooks allow Stripe to notify your backend when payment events occur. This is **critical** for security - never trust the frontend to confirm payments!

---

## Local Development Setup

### 1. Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xvf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases

### 2. Login to Stripe

```bash
stripe login
```

This opens your browser to authorize the CLI with your Stripe account.

### 3. Start Your Backend Server

```bash
cd backend
npm run dev
```

Server should be running on `http://localhost:5001`

### 4. Forward Webhooks to Local Server

In a **new terminal**, run:

```bash
stripe listen --forward-to localhost:5001/api/webhooks/stripe
```

You'll see output like:
```
> Ready! You are using Stripe API Version [2023-10-16]. Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

**Important:** Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Restart your backend server** after updating the `.env` file.

### 5. Keep Both Terminals Running

- **Terminal 1:** Backend server (`npm run dev`)
- **Terminal 2:** Stripe CLI (`stripe listen --forward-to localhost:5001/api/webhooks/stripe`)

---

## Testing the Complete Payment Flow

### Step 1: Create a Test User & Add Items to Cart

```bash
# Register a test user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@stripe.com",
    "password": "Test123!",
    "name": "Test User"
  }' \
  -c cookies.txt

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@stripe.com",
    "password": "Test123!"
  }' \
  -c cookies.txt

# Add books to cart
curl -X POST http://localhost:5001/api/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productId": 1, "quantity": 2}'

curl -X POST http://localhost:5001/api/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productId": 3, "quantity": 1}'
```

### Step 2: Create Checkout Session

```bash
curl -X POST http://localhost:5001/api/checkout \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_a1b2c3d4e5f6...",
  "sessionUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
  "orderId": 123
}
```

### Step 3: Complete Payment in Stripe

1. Copy the `sessionUrl` from the response
2. Open it in your browser
3. You'll see the Stripe Checkout page with your books
4. Use a **test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34` (any future date)
   - CVC: `123` (any 3 digits)
   - ZIP: `12345` (any 5 digits)
5. Click "Pay"

### Step 4: Watch the Webhook Fire

In your **Stripe CLI terminal**, you should immediately see:

```
2024-01-15 10:30:15   --> checkout.session.completed [evt_1AbC2dEfG3HiJkLm]
2024-01-15 10:30:15   <-- [200] POST http://localhost:5001/api/webhooks/stripe [evt_1AbC2dEfG3HiJkLm]
```

In your **backend server logs**, you should see:

```
✅ Webhook verified: checkout.session.completed
📦 Processing checkout.session.completed for session: cs_test_...
✅ Payment successful for order #123
   - Amount: 195.00 SAR
   - Payment Intent: pi_xxxxxxxxxxxxx
   - Cart cleared for user #1
```

### Step 5: Verify Order Status

Check the order was updated:

```bash
curl -X GET "http://localhost:5001/api/checkout/status?session_id=cs_test_..." \
  -b cookies.txt | python3 -m json.tool
```

**Expected Response:**
```json
{
  "success": true,
  "order": {
    "id": 123,
    "status": "completed",
    "paymentStatus": "paid",
    "totalAmount": "195.00",
    "createdAt": "2024-01-15T10:29:00.000Z"
  },
  "stripeStatus": "paid"
}
```

---

## Testing Different Scenarios

### Successful Payment
**Card:** `4242 4242 4242 4242`

Expected flow:
1. Checkout session created → order status: `pending`, payment: `pending`
2. Payment completed → webhook fires → order status: `completed`, payment: `paid`
3. Cart cleared automatically

### Declined Payment
**Card:** `4000 0000 0000 0002`

Expected flow:
1. Checkout session created
2. Payment declined → no webhook fires
3. Order remains: status: `pending`, payment: `pending`
4. User can retry with different card

### Insufficient Funds
**Card:** `4000 0000 0000 9995`

Expected flow:
1. Checkout session created
2. Payment fails with insufficient funds
3. No webhook fires
4. Order remains pending

### Authentication Required (3D Secure)
**Card:** `4000 0025 0000 3155`

Expected flow:
1. Checkout session created
2. User completes 3D Secure challenge
3. Webhook fires on success
4. Order marked as paid

### More test cards:**
https://stripe.com/docs/testing#cards

---

## Webhook Events Handled

### `checkout.session.completed`
- Fires immediately when payment succeeds
- Updates order to `paid` status
- Clears user's cart
- Updates product stock

### `checkout.session.async_payment_succeeded`
- For delayed payment methods (bank transfers, etc.)
- Same handling as `completed`

### `checkout.session.async_payment_failed`
- Marks order as `failed`
- User needs to retry

### `checkout.session.expired`
- Session expires after 30 minutes (or 24h default)
- Marks unpaid orders as `failed`

---

## Triggering Test Webhooks Manually

You can trigger test webhooks without going through the full payment flow:

```bash
# Trigger successful payment
stripe trigger checkout.session.completed

# Trigger async payment success
stripe trigger checkout.session.async_payment_succeeded

# Trigger payment failure
stripe trigger checkout.session.async_payment_failed
```

**Note:** These create mock sessions, so they won't match existing orders in your database.

---

## Troubleshooting

### Webhook signature verification failed

**Cause:** Webhook secret doesn't match

**Solution:**
1. Check the secret from `stripe listen` output
2. Update `STRIPE_WEBHOOK_SECRET` in `.env`
3. Restart backend server
4. Restart Stripe CLI

### Webhook not firing

**Checklist:**
- [ ] Stripe CLI running: `stripe listen --forward-to localhost:5001/api/webhooks/stripe`
- [ ] Backend server running on port 5001
- [ ] Payment actually completed in Stripe Checkout
- [ ] Check Stripe CLI terminal for errors

### Order not found for session

**Cause:** Session was created outside your app (e.g., by `stripe trigger`)

**Solution:** Use the complete flow: create checkout → pay → webhook

### Webhook returns 500 error

**Check:**
- Backend server logs for detailed error
- Database connection is active
- Order exists in database with the session ID

### Order already marked as paid

**This is normal!** Webhooks are idempotent. If the same webhook fires twice, the second one is safely ignored.

---

## Security Checklist

✅ **Webhook signature verification**
- Every webhook is verified with `STRIPE_WEBHOOK_SECRET`
- Invalid signatures are rejected with 400

✅ **Idempotency**
- Processing the same webhook twice doesn't create duplicate orders
- Already-paid orders are not processed again

✅ **Payment status validation**
- Only `payment_status === 'paid'` marks orders as complete
- Pending/unpaid sessions don't trigger order completion

✅ **Raw body preservation**
- Webhook route uses raw body middleware
- Signature verification requires exact body bytes

✅ **Order ownership**
- Status endpoint validates user owns the order
- No cross-user order access

---

## Production Deployment

### On Railway (Backend)

1. **Create webhook endpoint in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-api.railway.app/api/webhooks/stripe`
   - Events to send:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`
   - Click "Add endpoint"

2. **Copy the signing secret:**
   - After creating, click "Reveal" next to "Signing secret"
   - Copy the secret (starts with `whsec_`)

3. **Set environment variable on Railway:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

4. **Deploy and test:**
   - Use test mode first
   - Complete a test payment
   - Check Railway logs for webhook processing
   - Verify order status updates

5. **Switch to live mode** (when ready):
   - Create new webhook endpoint with **live mode** URL
   - Update `STRIPE_SECRET_KEY` to live key (starts with `sk_live_`)
   - Update `STRIPE_WEBHOOK_SECRET` to production webhook secret

---

## Monitoring Webhooks

### In Stripe Dashboard

1. Go to **Developers → Webhooks**
2. Click on your webhook endpoint
3. View:
   - Recent webhook attempts
   - Success/failure rate
   - Retry attempts
   - Response codes

### Failed Webhooks

Stripe automatically retries failed webhooks:
- Immediately
- After 1 hour
- After 2 hours
- After 4 hours
- After 8 hours
- After 16 hours

Your endpoint should return:
- **200** = Success, don't retry
- **4xx** = Invalid request, don't retry
- **5xx** = Server error, will retry

---

## Next Steps

After webhook testing is complete:

1. ✅ Frontend integration (redirect to Stripe)
2. ✅ Success page (show order confirmation)
3. ✅ Cancel page (handle cancelled payments)
4. ✅ Order history with payment status

**Webhook implementation complete!** 🎉
