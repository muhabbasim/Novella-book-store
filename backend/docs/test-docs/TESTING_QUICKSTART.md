# 🚀 Quick Start Guide - Phase 1 Testing

## Prerequisites
- Node.js installed
- PostgreSQL database
- Backend dependencies installed (`npm install`)

## Step-by-Step Setup

### 1. **Create Test Database** (5 minutes)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE ecommerce_test;

# Exit psql
\q
```

### 2. **Configure Test Environment** (2 minutes)
```bash
# Navigate to backend
cd backend

# Create test environment file
cp .env.test.example .env.test

# Edit .env.test with your credentials
nano .env.test
```

**Required Changes in `.env.test`:**
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ecommerce_test
SESSION_SECRET=any_random_string_for_testing
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_KEY
```

### 3. **Initialize Test Database** (2 minutes)
```bash
# Set init flag and start server once
INIT_DB=true NODE_ENV=test npm start

# You should see:
# ✅ Database connection verified
# 🔄 Initializing database tables...
# 📚 Tables created successfully

# Stop the server (Ctrl+C)
```

### 4. **Install Test Dependencies** (1 minute)
```bash
npm install
```

### 5. **Run Phase 1 Tests** (30 seconds)
```bash
npm run test:phase1
```

---

## Expected Output

```
 PASS  __tests__/phase1/auth.test.js
  Phase 1: Authentication Tests
    POST /api/auth/register
      ✓ should successfully register a new user (150ms)
      ✓ should reject duplicate email registration (45ms)
      ...
    
 PASS  __tests__/phase1/cart.test.js
  Phase 1: Cart Functionality Tests
    GET /api/cart
      ✓ should return empty cart for new user (40ms)
      ✓ should return cart with items (55ms)
      ...

 PASS  __tests__/phase1/orders.test.js
 PASS  __tests__/phase1/payment.test.js
 PASS  __tests__/phase1/stock-management.test.js

Test Suites: 5 passed, 5 total
Tests:       79 passed, 79 total
Snapshots:   0 total
Time:        15.234s
```

---

## Quick Commands

```bash
# Run all Phase 1 tests
npm run test:phase1

# Run specific test file
npm test -- __tests__/phase1/auth.test.js

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run all tests
npm test
```

---

## Troubleshooting

### ❌ Problem: "Database connection failed"
**Solution:**
```bash
# Check if PostgreSQL is running
pg_isadmin

# Check database exists
psql -U postgres -l | grep ecommerce_test

# Verify DATABASE_URL in .env.test
cat .env.test | grep DATABASE_URL
```

### ❌ Problem: "Cannot find module"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### ❌ Problem: "Tests hanging"
**Solution:**
```bash
# Run with force exit
npm test -- --forceExit --detectOpenHandles
```

### ❌ Problem: "Stripe tests failing"
**Solution:**
- Verify you're using test mode keys (starts with `sk_test_`)
- Check STRIPE_SECRET_KEY in `.env.test`

---

## Test Statistics

### Phase 1 Coverage:
- ✅ **79 critical tests**
- ✅ **5 test suites**
- ✅ **100% critical path coverage**

### Test Breakdown:
| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Authentication | 15 | Auth flows |
| Cart Operations | 17 | Cart management |
| Order Creation | 15 | Order processing |
| Payment Processing | 17 | Stripe integration |
| Stock Management | 15 | Inventory control |

---

## What's Being Tested?

### ✅ **Authentication**
- User registration & validation
- Login & logout
- Session management
- Security & authorization

### ✅ **Cart**
- Add/update/remove items
- Stock validation
- Total calculations
- User isolation

### ✅ **Orders**
- Order creation & validation
- Stock reduction
- Cart clearing
- Order history

### ✅ **Payments**
- Stripe checkout session
- Payment status tracking
- Security validations
- Price integrity

### ✅ **Stock**
- Availability checks
- Race condition handling
- Atomic operations
- Edge cases

---

## Next Steps

After Phase 1 passes:
1. ✅ **Deploy to staging** - Your critical paths are covered
2. 📋 **Implement Phase 2** - Product endpoints, security tests
3. 🚀 **Production ready** - Core functionality verified

---

## Success Criteria

Your backend is **production-ready** when:
- [x] All 79 Phase 1 tests pass
- [ ] Coverage > 85%
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring/logging setup

---

## Need Help?

1. Check `__tests__/README.md` for detailed documentation
2. Review individual test files for examples
3. Check test output for specific error messages
4. Verify environment configuration

---

**Last Updated**: Phase 1 Implementation
**Est. Setup Time**: ~10 minutes
**Test Runtime**: ~15 seconds
