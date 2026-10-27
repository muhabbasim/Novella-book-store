# Complete Stripe Integration Testing Guide

## 🎯 Overview

This guide walks through testing the complete Stripe payment integration from start to finish.

---

## ✅ Prerequisites

Before testing, ensure you have:

1. ✅ Stripe account (test mode)
2. ✅ Stripe CLI installed
3. ✅ Backend environment variables configured
4. ✅ Frontend environment variables configured
5. ✅ Database migration completed

---

## 📋 Step-by-Step Testing

### Step 1: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Connected to PostgreSQL database
✅ Database tables initialized successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
║   🚀 Server running on port 5001        ║
║   📍 API: http://localhost:5001         ║
```

**Verify endpoints:**
```bash
curl http://localhost:5001/
```

Should show all endpoints including `/api/checkout` and `/api/webhooks/stripe`.

---

### Step 2: Start Stripe Webhook Forwarding

In a **new terminal**:

```bash
stripe listen --forward-to localhost:5001/api/webhooks/stripe
```

**Expected output:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Important:**
1. Copy the `whsec_xxx` secret
2. Add to `backend/.env` as `STRIPE_WEBHOOK_SECRET`
3. Restart backend server (Step 1)
4. Keep this terminal running

---

### Step 3: Start Frontend

In **another new terminal**:

```bash
# From project root
npm run dev
```

**Expected output:**
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### Step 4: Create Test User

1. Open browser: `http://localhost:5173`
2. Click "Register" (top right)
3. Fill in:
   - Name: Test User
   - Email: test@stripe.com
   - Password: Test123!
4. Click "Register"
5. You should be logged in automatically

---

### Step 5: Add Books to Cart

1. Browse the bookstore
2. Click on any book
3. Set quantity (e.g., 2)
4. Click "Add to Cart"
5. Repeat for 2-3 different books
6. Cart icon should show total items

---

### Step 6: Go to Checkout

1. Click cart icon (top right)
2. Review your cart
3. Click "Proceed to Checkout"
4. You should see the CheckoutStripe page with:
   - Order summary
   - All cart items with images
   - Total amount
   - Customer email
   - Stripe security message
   - "Proceed to Payment" button

---

### Step 7: Initiate Payment

1. Click "Proceed to Payment"
2. **Watch backend logs** - should see:
   ```
   POST /api/checkout 200
   ```
3. Browser redirects to Stripe Checkout page

**If redirect fails:**
- Check browser console for errors
- Check backend logs
- Verify `STRIPE_SECRET_KEY` in `.env`

---

### Step 8: Complete Payment on Stripe

On the Stripe Checkout page:

**Test Card Details:**
- Card number: `4242 4242 4242 4242`
- Expiry: `12/34` (any future date)
- CVC: `123` (any 3 digits)
- Name: Any name
- ZIP: `12345` (any 5 digits)
- Email: Should be pre-filled

Click "Pay"

---

### Step 9: Watch Webhook Fire

**In Stripe CLI terminal**, you should immediately see:

```
2024-01-15 10:30:15   --> checkout.session.completed [evt_xxxxx]
2024-01-15 10:30:15   <-- [200] POST http://localhost:5001/api/webhooks/stripe
```

**In backend server terminal**, you should see:

```
✅ Webhook verified: checkout.session.completed
📦 Processing checkout.session.completed for session: cs_test_xxx
✅ Payment successful for order #1
   - Amount: 195.00 SAR
   - Payment Intent: pi_xxxxx
   - Cart cleared for user #1
```

---

### Step 10: Success Page

After payment, you'll be redirected to success page.

**You should see:**
1. ✅ Green checkmark with animation
2. "Order Confirmed!" message
3. Order number (e.g., #1)
4. Order date
5. Payment status: "paid"
6. Total amount
7. "What happens next" section
8. Buttons: "View Order Details" and "Continue Shopping"

**Behind the scenes:**
- Success page calls `/api/checkout/status?session_id=xxx`
- Backend verifies webhook updated the order
- Cart is automatically cleared

---

### Step 11: Verify Order in Database

Check the order was created and marked as paid:

```bash
# Connect to your database
psql $DATABASE_URL

# Check order
SELECT id, user_id, total_amount, status, payment_status, stripe_session_id, stripe_payment_intent_id 
FROM orders 
WHERE id = 1;
```

**Expected result:**
```
 id | user_id | total_amount | status    | payment_status | stripe_session_id | stripe_payment_intent_id
----+---------+--------------+-----------+----------------+-------------------+-------------------------
  1 |       1 |       195.00 | completed | paid           | cs_test_xxx       | pi_xxx
```

---

### Step 12: Verify Cart Cleared

```bash
# Check cart is empty
SELECT * FROM carts WHERE user_id = 1;
```

**Expected:** 0 rows (cart cleared)

---

### Step 13: Test Cancellation Flow

1. Add books to cart again
2. Go to checkout
3. Click "Proceed to Payment"
4. On Stripe page, click browser **Back button** or **Cancel**
5. You should be redirected to `/checkout/cancel`

**Cancel page should show:**
- ⚠️ Yellow warning icon
- "Checkout Cancelled" message
- Your cart items (preserved)
- Cart total
- "What happened?" explanation
- Buttons: "Try Again", "Review Cart", "Continue Shopping"

---

## 🧪 Additional Test Scenarios

### Test 1: Empty Cart

1. Clear your cart
2. Try to access `/checkout` directly
3. **Expected:** Redirected to `/cart`

### Test 2: Unauthenticated User

1. Logout
2. Try to access `/checkout`
3. **Expected:** Redirected to `/login`

### Test 3: Declined Card

Use declined test card:
- Card: `4000 0000 0000 0002`
- **Expected:** Payment declined on Stripe page
- Order remains pending in database
- User can retry with different card

### Test 4: Webhook Retry (Simulate Delay)

1. Stop Stripe CLI webhook forwarding
2. Complete a payment on Stripe
3. Browser redirects to success page
4. **Expected:** Success page shows "Payment Processing" with retry attempts
5. Restart Stripe CLI forwarding
6. **Expected:** Success page automatically detects payment after retry

### Test 5: Invalid Session ID

1. Visit: `http://localhost:5173/checkout/success?session_id=invalid`
2. **Expected:** Error message about invalid session

---

## 🔍 Troubleshooting

### Issue: "Failed to create checkout session"

**Check:**
- Backend server running
- User logged in
- Cart has items
- `STRIPE_SECRET_KEY` in `.env`
- Backend logs for detailed error

### Issue: Webhook signature verification failed

**Check:**
- Stripe CLI running
- Webhook secret matches CLI output
- Backend restarted after updating `.env`
- Webhook route registered before `express.json()`

### Issue: Order not marked as paid

**Check:**
- Webhook fired (check Stripe CLI logs)
- Backend logs show "Payment successful"
- Database has `stripe_session_id`
- Payment status column exists

### Issue: Success page stuck on "Verifying"

**Check:**
- Webhook completed successfully
- Order exists in database
- Session ID in URL matches database
- Backend `/api/checkout/status` endpoint working

### Issue: Cart not clearing

**Check:**
- Webhook fired and completed
- Backend logs show "Cart cleared"
- Database: `SELECT * FROM carts WHERE user_id = X;`

---

## 📊 Checklist

Use this checklist to verify everything works:

### Backend
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Stripe columns exist in orders table
- [ ] `/api/checkout` endpoint accessible
- [ ] `/api/webhooks/stripe` endpoint accessible
- [ ] Environment variables configured

### Stripe Integration
- [ ] Stripe CLI installed
- [ ] Webhook forwarding running
- [ ] Webhook secret configured
- [ ] Test API keys valid

### Frontend
- [ ] Frontend starts without errors
- [ ] Can register/login user
- [ ] Can add items to cart
- [ ] Checkout page loads
- [ ] "Proceed to Payment" redirects to Stripe
- [ ] Success page shows after payment
- [ ] Cancel page shows on cancellation

### Payment Flow
- [ ] Checkout session created
- [ ] Pending order in database
- [ ] Stripe Checkout page opens
- [ ] Test card payment succeeds
- [ ] Webhook fires immediately
- [ ] Order marked as paid
- [ ] Cart cleared automatically
- [ ] Success page shows order details

### Error Handling
- [ ] Empty cart redirects to cart page
- [ ] Unauthenticated redirects to login
- [ ] Invalid session shows error
- [ ] Declined card shows Stripe error
- [ ] Network errors show user-friendly messages

---

## 🚀 Next: Production Deployment

Once all tests pass, you're ready for:

1. **Deploy Backend to Railway**
   - Set environment variables
   - Create production webhook in Stripe Dashboard
   - Test with live mode

2. **Deploy Frontend to Vercel**
   - Set `VITE_API_URL` to Railway backend URL
   - Verify CORS settings

3. **Production Testing**
   - Use test mode first
   - Complete end-to-end test
   - Switch to live mode when ready

---

## 📝 Test Results Log

Document your test results:

| Test | Status | Notes |
|------|--------|-------|
| Backend starts | ✅ |  |
| Webhook forwarding | ✅ |  |
| Frontend starts | ✅ |  |
| User registration | ✅ |  |
| Add to cart | ✅ |  |
| Checkout page | ✅ |  |
| Payment redirect | ✅ |  |
| Stripe payment | ✅ |  |
| Webhook fires | ✅ |  |
| Order marked paid | ✅ |  |
| Cart cleared | ✅ |  |
| Success page | ✅ |  |
| Cancel flow | ✅ |  |

---

**Happy Testing! 🎉**

For issues, check:
- Backend logs
- Browser console
- Stripe CLI logs
- Database state
