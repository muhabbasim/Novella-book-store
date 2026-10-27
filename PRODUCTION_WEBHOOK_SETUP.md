# Production Webhook Setup for Stripe Test Mode

## Prerequisites
- [ ] Backend is deployed and accessible via public URL
- [ ] You have access to Stripe Dashboard in Test mode
- [ ] You can update environment variables in your hosting platform

## Setup Steps

### 1. Get Your Backend URL
Your deployed backend URL (e.g., `https://your-app.railway.app`):
```
_______________________________________________
```

### 2. Add Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Ensure you're in **Test mode** (toggle in top right)
3. Click **"Add endpoint"**

**Configuration:**
```
Endpoint URL: https://YOUR-BACKEND-URL/api/webhooks/stripe

Events to send:
  ✓ checkout.session.completed
  ✓ checkout.session.async_payment_succeeded
  ✓ checkout.session.async_payment_failed
  ✓ checkout.session.expired
```

4. Click **"Add endpoint"**

### 3. Get Webhook Signing Secret

1. Click on your newly created endpoint
2. Find "Signing secret" section
3. Click **"Reveal"** or **"Click to reveal"**
4. Copy the secret (starts with `whsec_`)

```
Signing Secret: whsec_________________________________
```

### 4. Update Environment Variables

Update these in your hosting platform (Railway/Vercel/Render):

```env
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Other required variables
DATABASE_URL=postgresql://...
SESSION_SECRET=your-session-secret
FRONTEND_URL=https://your-frontend-url.com
PORT=5001
NODE_ENV=production
```

### 5. Restart Your Backend

After updating environment variables, restart your backend service.

### 6. Test the Webhook

**Test Checkout Flow:**
1. Go to your deployed frontend
2. Add products to cart
3. Proceed to checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete payment

**Verify in Stripe Dashboard:**
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your endpoint
3. Check "Recent events" section
4. You should see events with ✓ status

**Verify in Your App:**
- Order status should change to "confirmed"
- Payment status should change to "paid"
- Success page should show immediately

### 7. Check Backend Logs

In your hosting platform, check backend logs for:

✅ **Success logs:**
```
✅ Webhook verified: checkout.session.completed
📦 Processing checkout.session.completed for session: cs_xxx
✅ Payment successful for order #X
   - Amount: XXX SAR
   - Payment Intent: pi_xxx
```

❌ **Error logs (if webhook fails):**
```
❌ Webhook signature verification failed
❌ Order not found for session: cs_xxx
```

## Troubleshooting

### Webhook Events Not Showing Up
- [ ] Verify endpoint URL is correct: `https://YOUR-BACKEND/api/webhooks/stripe`
- [ ] Check if backend is running and accessible
- [ ] Try sending a test event from Stripe Dashboard

### Webhook Signature Verification Failed
- [ ] Make sure `STRIPE_WEBHOOK_SECRET` matches the signing secret from dashboard
- [ ] Verify you're using the secret from the correct endpoint
- [ ] Check if you revealed the actual secret (not the endpoint ID)

### Order Not Updating
- [ ] Check backend logs for webhook processing
- [ ] Verify webhook events are being received (check Stripe Dashboard)
- [ ] Ensure database connection is working
- [ ] Check if `orderModel.updatePaymentStatus()` is working

### Test Webhook from Dashboard

To manually test without completing a checkout:

1. Go to your webhook endpoint in Stripe Dashboard
2. Click **"Send test webhook"**
3. Select event: `checkout.session.completed`
4. Click **"Send test webhook"**
5. Check the response and your backend logs

## Test Mode vs Live Mode

**You're currently in TEST MODE:**
- Uses test API keys: `sk_test_xxx` and `pk_test_xxx`
- Test card: `4242 4242 4242 4242`
- Webhook secret from test mode endpoint: `whsec_xxx`
- No real money is charged

**When going to LIVE MODE:**
- Create a new webhook endpoint in Live mode
- Use live API keys: `sk_live_xxx` and `pk_live_xxx`
- Update environment variables with live keys
- Use real payment methods
- Real money will be charged!

## Quick Reference

**Stripe Dashboard URLs:**
- Test Webhooks: https://dashboard.stripe.com/test/webhooks
- Test Payments: https://dashboard.stripe.com/test/payments
- Test Customers: https://dashboard.stripe.com/test/customers

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Auth required: `4000 0025 0000 3155`

**Your Webhook Endpoint:**
```
https://YOUR-BACKEND-URL/api/webhooks/stripe
```

## Checklist: Webhook is Working ✓

- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook secret added to production environment variables
- [ ] Backend restarted after updating env vars
- [ ] Test checkout completed successfully
- [ ] Webhook events showing as successful in Stripe Dashboard
- [ ] Order status updated to "confirmed" in database
- [ ] Payment status updated to "paid" in database
- [ ] Success page displays correctly
- [ ] Cart is cleared after successful payment

---

## Notes

- Keep your webhook signing secret secure
- Never commit secrets to git
- Test mode webhooks are separate from live mode webhooks
- You'll need to create a new endpoint when going live
- Monitor webhook delivery in production via Stripe Dashboard
