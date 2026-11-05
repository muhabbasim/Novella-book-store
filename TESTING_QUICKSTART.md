# Testing Quick Start - Novella Book Store

## Setup (One Time)

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Run Tests

### Unit & Component Tests (Fast - 2 seconds)
```bash
npm test
```

### E2E Tests (Full Journey - Requires Backend)
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

### Watch Mode (Development)
```bash
npm test -- --watch
```

### All Tests
```bash
npm test && npm run test:e2e
```

## Debug Tests

### Vitest UI
```bash
npm run test:ui
```

### Playwright UI
```bash
npm run test:e2e:ui
```

### Run Single Test
```bash
npm test cart.test.jsx
```

## Test Coverage

✅ **22 tests passing**
- 6 cart tests
- 5 authentication tests  
- 7 checkout tests
- 4 product browsing tests

✅ **10 critical scenarios covered**
1. Product browsing ✓
2. Shopping cart ✓
3. Cart persistence ✓
4. Authentication ✓
5. Protected routes ✓
6. Checkout validation ✓
7. Stripe checkout ✓
8. Order confirmation ✓
9. Navigation ✓
10. Error handling ✓

## Production Build

```bash
npm run build
```

## Before Deployment

```bash
# Run all checks
npm test && npm run build && npm run test:e2e
```

## Need Help?

See full guides:
- **TEST_GUIDE.md** - Complete testing documentation
- **TEST_RESULTS.md** - Detailed test results and coverage
