# Backend Testing Suite

## 📁 Test Structure

```
backend/__tests__/
├── api/                              # API endpoint tests
│   ├── auth.api.test.js             # Authentication API tests
│   ├── cart.api.test.js             # Cart API tests
│   ├── orders.api.test.js           # Orders API tests
│   └── payment.api.test.js          # Payment/Checkout API tests
│
├── integration/                      # Integration tests
│   ├── critical-path.integration.test.js    # Critical user flows
│   └── stock-management.integration.test.js  # Stock management flows
│
├── unit/                            # Unit tests (for future use)
│   └── (empty - ready for model/service unit tests)
│
├── fixtures/                        # Test fixtures and mocks
│   └── stripe-service.mock.js      # Stripe service mock
│
├── helpers/                         # Test utilities
│   ├── test-helpers.js             # Common test helper functions
│   └── db-guard.js                 # Database safety guards
│
├── globalSetup.js                   # Jest global setup
├── jest.setup.js                    # Jest configuration
└── README.md                        # This file
```

---

## 📊 Test Coverage

### API Tests (27 test suites)

#### 🔐 Authentication (`auth.api.test.js`)
- User registration (validation, duplicates, session creation)
- User login/logout
- Current user retrieval
- Session persistence
- **Total: 13 tests**

#### 🛒 Cart (`cart.api.test.js`)
- Get cart (empty, with items, authentication)
- Add items (validation, stock checks, duplicates)
- Update quantities (validation, stock limits)
- Remove items
- Cart calculations and user isolation
- **Total: 19 tests**

#### 📦 Orders (`orders.api.test.js`)
- Create orders from cart
- Order history retrieval
- Single order details
- Stock reduction validation
- Empty cart and insufficient stock handling
- **Total: 15 tests**

#### 💳 Payment (`payment.api.test.js`)
- Checkout session creation
- Payment status retrieval
- Server-side price validation
- Stock validation at checkout
- Security and edge cases
- **Total: 17 tests**

### Integration Tests

#### 🚀 Critical Path (`critical-path.integration.test.js`)
Fast subset for CI/CD and pre-commit hooks
- Auth → Cart → Orders → Payment → Stock validation
- **Total: 13 tests**

#### 📊 Stock Management (`stock-management.integration.test.js`)
Comprehensive stock validation across the entire flow
- Add to cart with cumulative quantities
- Update cart with stock limits
- Order creation with stock reduction
- Race conditions and edge cases
- Atomic operations
- **Total: 16 tests**

---

## 🚀 Quick Start

### 1. Setup Test Database
```bash
cd backend
npm run test:db:create
```

### 2. Run Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- api/auth.api.test.js

# Run integration tests only
npm test -- integration/

# Run API tests only
npm test -- api/

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

---

## 🛠️ Test Helpers

### Database Helpers (`helpers/test-helpers.js`)

```javascript
import {
  setupTestDatabase,      // Clean database before each test
  createTestUser,         // Create test user
  createTestProduct,      // Create test product
  addTestCartItem,        // Add item to cart directly
  getSessionCookie        // Extract session cookie from response
} from './helpers/test-helpers.js';
```

### Database Guard (`helpers/db-guard.js`)

Prevents accidental test runs against production databases:
- Validates database name contains "test"
- Checks for localhost or explicit remote test flag
- Builds test database URLs

---

## 📝 Writing New Tests

### API Test Template

```javascript
import { describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { 
  setupTestDatabase, 
  createTestUser,
  getSessionCookie 
} from '../helpers/test-helpers.js';

describe('Feature Name API Tests', () => {
  let authUser;
  let sessionCookie;

  beforeEach(async () => {
    await setupTestDatabase();
    authUser = await createTestUser('test@example.com', 'password123', 'Test User');
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    sessionCookie = getSessionCookie(loginResponse);
  });

  test('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Cookie', sessionCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

### Integration Test Template

```javascript
import { describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { pool } from '../../src/config/database.js';
import { 
  setupTestDatabase, 
  createTestUser,
  createTestProduct,
  getSessionCookie 
} from '../helpers/test-helpers.js';

describe('Feature Flow Integration Tests', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  test('should complete entire user flow', async () => {
    // 1. Setup
    const user = await createTestUser('flow@test.com', 'pass123', 'Flow User');
    const product = await createTestProduct({ name: 'Test', price: 99.99 });
    
    // 2. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'flow@test.com', password: 'pass123' });
    const cookie = getSessionCookie(loginRes);
    
    // 3. Add to cart
    await request(app)
      .post('/api/cart')
      .set('Cookie', cookie)
      .send({ productId: product.id, quantity: 2 })
      .expect(201);
    
    // 4. Create order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .expect(201);
    
    // 5. Verify database state
    const stockCheck = await pool.query(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [product.id]
    );
    expect(stockCheck.rows[0].stock_quantity).toBe(8); // 10 - 2
  });
});
```

---

## 🔒 Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` for setup
- Clean database state between tests

### 2. Naming Convention
- **API tests**: `feature.api.test.js`
- **Integration tests**: `feature-flow.integration.test.js`
- **Unit tests**: `service-name.unit.test.js`
- **Fixtures**: `resource-name.mock.js` or `resource-name.fixture.js`

### 3. Test Organization
```javascript
describe('Resource Name', () => {
  describe('HTTP METHOD /endpoint', () => {
    test('should handle success case', async () => {});
    test('should handle error case', async () => {});
    test('should require authentication', async () => {});
  });
});
```

### 4. Assertions
- Use specific assertions (`toBe`, `toEqual`, `toMatchObject`)
- Test both success and error cases
- Verify database state when applicable
- Check authentication requirements

---

## 🚨 Common Issues

### Tests Hanging
```bash
# Use detectOpenHandles to find unclosed connections
npm test -- --detectOpenHandles
```

### Database Connection Issues
- Verify `.env.test` exists and has correct DATABASE_URL
- Ensure test database exists: `npm run test:db:create`
- Check database name contains "test"

### Import Path Issues
- Use relative paths from test file location
- API tests: `../helpers/test-helpers.js`
- Integration tests: `../helpers/test-helpers.js`

---

## 📈 Coverage Goals

- **API Endpoints**: 95%+ coverage
- **Critical Paths**: 100% coverage
- **Edge Cases**: All major scenarios covered

---

## 🔄 CI/CD Integration

### Pre-commit Hook
```bash
# Add to .husky/pre-commit or package.json
npm test -- integration/critical-path.integration.test.js
```

### GitHub Actions
```yaml
- name: Run Backend Tests
  run: |
    cd backend
    npm install
    npm test
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    NODE_ENV: test
```

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

## ✅ Summary

- **Total Tests**: 93 tests across API and Integration suites
- **Structure**: Clean separation of API, Integration, and Unit tests
- **Maintainability**: Organized folders and clear naming conventions
- **Ready for Frontend**: Backend tests are complete and organized

**Status**: ✅ **Production Ready** - All tests passing, clean structure
