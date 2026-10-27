# Environment Configuration Guide

## 📁 Files Overview

```
.env               → Local development only
.env.production   → Local production testing only
Railway Dashboard → ACTUAL production (deployed app)
```

---

## 🎯 Simple Answer

### **Railway Deployment:**
- `.env` = Development (your computer)
- `.env.production` = Optional (local testing with prod database)
- **Railway Dashboard Variables = REAL Production** ✅

---

## 📋 When Each File is Used

### 1. **`.env`** (Local Development)

**Used when:**
```bash
npm run dev           # ← Uses .env
npm run seed:dev     # ← Uses .env
npm run init:db:dev  # ← Uses .env
```

**Purpose:** Local development with dev database

**Should contain:**
- Dev database URL
- Test Stripe keys
- localhost frontend URL

---

### 2. **`.env.production`** (Local Production Testing)

**Used when:**
```bash
npm run start:prod       # ← Uses .env.production
npm run seed:prod        # ← Uses .env.production
npm run seed:prod:fresh  # ← Uses .env.production
npm run init:db:prod     # ← Uses .env.production
```

**Purpose:** Test with production database from your computer

**Should contain:**
- Production database URL
- Test Stripe keys (for safety)
- Production frontend URL

**⚠️ Note:** This file is **NOT** used by Railway!

---

### 3. **Railway Dashboard Variables** (ACTUAL Production)

**Used when:**
```bash
git push  # Railway automatically deploys and uses these
```

**Purpose:** Your live deployed application

**Should contain:**
- Production database URL
- **LIVE** Stripe keys (sk_live_...)
- Production frontend URL
- **DIFFERENT** session secret from local

---

## 🔑 Session Secret Strategy

### Current Situation:
```
.env              → de6f79bd83e0a68be48fda84e19d855141b2bb212646efd78983f0b3af82e63b
.env.production   → LOCAL_PROD_TEST_SECRET_de6f79bd83e0a68be...
Railway Dashboard → <GENERATE NEW ONE>
```

### Why Different Secrets:
1. **Security Isolation** - If dev secret leaks, production is safe
2. **Environment Separation** - Clear distinction between environments
3. **Best Practice** - Industry standard

### Generate New Railway Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to Railway Dashboard
```

---

## 💡 Practical Workflow

### Daily Development:
```bash
# Just use dev environment
npm run dev

# Everything uses .env file
```

### Testing Database Seed Locally:
```bash
# Seed production database from your computer
npm run seed:prod

# Uses .env.production file
# Safe because you're using test Stripe keys
```

### Deploy to Production:
```bash
git add .
git commit -m "new feature"
git push

# Railway automatically:
# 1. Pulls your code
# 2. Uses Railway Dashboard variables (NOT .env.production)
# 3. Deploys with LIVE Stripe keys
```

---

## ✅ Security Checklist

### Local Files (Gitignored):
- [ ] `.env` is gitignored
- [ ] `.env.production` is gitignored
- [ ] Neither file contains LIVE Stripe keys

### Railway Dashboard:
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` points to prod database
- [ ] `SESSION_SECRET` is unique (different from local)
- [ ] `STRIPE_SECRET_KEY` is `sk_live_...` (not `sk_test_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` is from Stripe Live mode
- [ ] `FRONTEND_URL` is your Vercel URL

---

## 🚨 Important Notes

### About `.env.production`:

**Pros of keeping it:**
- ✅ Can test prod database locally
- ✅ Can seed prod database easily
- ✅ Can debug prod issues locally

**Cons of keeping it:**
- ⚠️ Could accidentally use it thinking it affects Railway (it doesn't)
- ⚠️ Need to keep it in sync with Railway variables
- ⚠️ Risk of committing it with real secrets

**Best Practice:**
- Keep it gitignored ✅
- Use test Stripe keys in it ✅
- Add comments that Railway uses its own variables ✅

---

## 🎯 Quick Reference

| Scenario | File Used | Command |
|----------|-----------|---------|
| Local development | `.env` | `npm run dev` |
| Seed dev database | `.env` | `npm run seed:dev` |
| Seed prod database (from local) | `.env.production` | `npm run seed:prod` |
| Test locally with prod database | `.env.production` | `npm run start:prod` |
| Deploy to Railway | Railway Dashboard | `git push` |
| Railway runs your app | Railway Dashboard | (automatic) |

---

## 📝 Summary

### Simple Answer to Your Question:

**"Does it have to be added to .env.production too?"**

**Answer:**

- **For Railway deployment:** NO - Railway doesn't use `.env.production`
- **For local production testing:** YES - So you can test/seed prod database locally
- **For your use case (seeding prod DB):** YES - Your seed scripts use `.env.production`

---

## 🔧 What You Should Do

### Right Now (Already Done ✅):
- ✅ `.env.production` updated with comments
- ✅ `.gitignore` updated to exclude it

### Next Steps:
1. **Go to Railway Dashboard**
   - Navigate to: Your Service → Variables

2. **Update These Variables:**
   ```
   SESSION_SECRET → Generate new: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   STRIPE_SECRET_KEY → Get from Stripe Live mode (sk_live_...)
   STRIPE_WEBHOOK_SECRET → Get from Stripe Live mode webhook
   ```

3. **Test Your Setup:**
   ```bash
   # Seed production database (uses .env.production)
   npm run seed:prod:fresh
   
   # Verify products exist in prod database
   # Check your Neon dashboard
   ```

4. **Deploy:**
   ```bash
   git push
   # Railway uses its Dashboard variables, not .env.production
   ```

---

**Bottom Line:** `.env.production` is useful for YOU to work with the production database from your computer, but Railway completely ignores it and uses Dashboard variables instead. 🎯
