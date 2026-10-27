# Railway Deployment Guide

## Environment Variables Setup

### ✅ Where to Set Production Variables

**On Railway Dashboard:**
1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Set these variables:

```env
NODE_ENV=production
PORT=5001

# Production Database (your Neon production DB)
DATABASE_URL=postgresql://neondb_owner:npg_8h9uQURAtVkF@ep-small-fog-b4pbeuo9-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require

# Production Session Secret (DIFFERENT from dev)
SESSION_SECRET=<generate-new-secret-here>

# Stripe LIVE Keys (NOT test keys)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# Production Frontend URL
FRONTEND_URL=https://ai-assisted-developer-practicum.vercel.app
```

---

## Session Secret Strategy

### ✅ Correct Approach (Railway):

```
Local Development (.env):
SESSION_SECRET=de6f79bd83e0a68be48fda84e19d855141b2bb212646efd78983f0b3af82e63b

Railway Production (Set in Railway Dashboard):
SESSION_SECRET=<DIFFERENT_SECRET_HERE>
```

**Why this works:**
- Railway doesn't read `.env` or `.env.production` files
- Railway uses its own environment variables system
- Your local `.env` file is gitignored
- Railway variables are secure and separate

### Generate New Production Secret:

```bash
# Run this and copy the output
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste it in Railway Variables as `SESSION_SECRET`

---

## File Structure for Railway Deployment

```
backend/
├── .env                    # Local dev only (gitignored)
├── .env.production         # Optional: local prod testing (gitignored)
├── .env.example           # Template (committed)
└── Railway Dashboard       # ← Production secrets live here!
```

---

## Deployment Workflow

### 1. **Local Development**
```bash
npm run dev
# Uses .env file automatically
```

### 2. **Local Production Testing (Optional)**
```bash
npm run start:prod
# Uses .env.production file
# Good for debugging before deploying
```

### 3. **Railway Production**
```bash
git push
# Railway automatically:
# 1. Detects push
# 2. Builds your app
# 3. Uses Railway environment variables
# 4. Deploys to production
```

---

## Railway Environment Variables Checklist

Go to Railway → Your Service → Variables tab and verify:

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` points to **production** Neon database
- [ ] `SESSION_SECRET` is **different** from your local `.env`
- [ ] `STRIPE_SECRET_KEY` uses `sk_live_...` (not `sk_test_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` is from Stripe Live mode
- [ ] `FRONTEND_URL` points to your Vercel production URL
- [ ] `PORT=5001` (or Railway's default)

---

## Testing Production Locally (Optional)

If you want to test with production database locally:

### 1. Create `.env.production` (local testing only)
```env
NODE_ENV=production
DATABASE_URL=postgresql://...your-prod-db...
SESSION_SECRET=<different-from-dev>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://your-frontend.vercel.app
```

### 2. Run locally with production config
```bash
npm run start:prod
```

### 3. Test it works
```bash
curl http://localhost:5001
```

**⚠️ Warning:** Be careful when testing locally with production database!

---

## Security Best Practices

### ✅ DO:
- Set production secrets in Railway Dashboard
- Use different session secrets for dev/prod
- Use Stripe LIVE keys in Railway (not test keys)
- Keep `.env` gitignored
- Keep `.env.production` gitignored (if you have it)

### ❌ DON'T:
- Commit `.env` files to git
- Use the same session secret everywhere
- Use Stripe test keys in production
- Hardcode secrets in code

---

## Verifying Your Railway Setup

### Check Environment Variables:
1. Go to Railway Dashboard
2. Open your service
3. Click "Variables" tab
4. Verify all secrets are set

### Check Logs:
```
Railway Dashboard → Your Service → Deployments → Latest → Logs
```

Look for:
```
✅ Connected to PostgreSQL database
🚀 Server running on port 5001
Environment: production
```

### Test Your API:
```bash
# Test health check
curl https://your-railway-app.up.railway.app

# Test products endpoint
curl https://your-railway-app.up.railway.app/api/products
```

---

## Common Issues

### Issue 1: "Using development database in production"
**Cause:** Railway environment variables not set
**Fix:** Set `DATABASE_URL` in Railway Dashboard

### Issue 2: "Session not persisting"
**Cause:** Session secret mismatch or not set
**Fix:** Set `SESSION_SECRET` in Railway Dashboard

### Issue 3: "Stripe payments not working"
**Cause:** Using test keys in production
**Fix:** 
1. Go to Stripe Dashboard
2. Switch to "Live mode"
3. Copy Live Secret Key
4. Update `STRIPE_SECRET_KEY` in Railway

### Issue 4: "CORS errors"
**Cause:** Frontend URL mismatch
**Fix:** Set `FRONTEND_URL` in Railway to your Vercel URL

---

## Railway vs Local Environment Variables

| Variable | Local (.env) | Railway (Dashboard) | Purpose |
|----------|-------------|---------------------|---------|
| NODE_ENV | development | production | Environment mode |
| DATABASE_URL | Dev Neon DB | Prod Neon DB | Separate databases |
| SESSION_SECRET | Any value | DIFFERENT value | Security isolation |
| STRIPE_SECRET_KEY | sk_test_... | sk_live_... | Test vs Live |
| FRONTEND_URL | localhost:5173 | vercel.app | Local vs Deployed |

---

## Summary

### ✅ Your Current Setup is CORRECT if:
- You're deploying to Railway
- Production secrets are in Railway Dashboard (not in files)
- `.env` is gitignored
- Railway environment variables are properly configured

### ⚠️ You Need to Fix:
1. **Railway Dashboard:**
   - Change `SESSION_SECRET` to a different value than dev
   - Change `STRIPE_SECRET_KEY` to `sk_live_...` (not `sk_test_...`)
   - Change `STRIPE_WEBHOOK_SECRET` to live webhook secret

2. **Local (Optional):**
   - Keep `.env.production` gitignored
   - Only use it for local production testing

### 🎯 Action Items:

1. **Go to Railway Dashboard NOW:**
   ```
   Railway → Your Service → Variables
   ```

2. **Update these variables:**
   ```
   SESSION_SECRET → Generate new: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   STRIPE_SECRET_KEY → Get from Stripe Dashboard (Live mode)
   STRIPE_WEBHOOK_SECRET → Get from Stripe Dashboard (Live mode)
   ```

3. **Redeploy:**
   ```bash
   git push
   # Railway will automatically redeploy with new variables
   ```

---

**Your setup is fundamentally correct for Railway deployment!** Just need to update the secrets in Railway Dashboard, not in files. 🚀
