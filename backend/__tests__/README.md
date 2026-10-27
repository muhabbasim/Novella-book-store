# Backend Testing Suite - Phase 1

## Overview

This testing suite implements **Phase 1 Critical Tests** for the e-commerce backend to ensure production reliability.

## Test Coverage

### Phase 1 Tests (Critical - Must Have)

#### 1. **Authentication Tests** (`auth.test.js`)
- ✅ User registration
  - Successful registration
  - Duplicate email rejection
  - Required fields validation
  - Email format validation
- ✅ User login
  - Successful login with correct credentials
  - Invalid credentials rejection
  - Non-existent email handling
  - Required fields validation
- ✅ User logout
  - Session destruction
  - Cookie clearing
- ✅ Current user retrieval
  - Authenticated user data
  - Unauthorized access prevention
- ✅ Session persistence
  - Multi-request session maintenance

**Total: 15 tests**

---

#### 2. **Cart Functionality Tests** (`cart.test.js`)
- ✅ Get cart
  - Empty cart for new users
  - Cart with items
  - Authentication requirement
- ✅ Add to cart
  - Successful item addition
  - Quantity increment for existing items
  - Non-existent product rejection
  - Stock availability validation
  - Default quantity handling
  - Authentication requirement
- ✅ Update cart
  - Quantity updates
  - Minimum quantity validation
  - Stock limit validation
  - Non-existent item handling
  - Authentication requirement
- ✅ Remove from cart
  - Item removal
  - Non-existent item handling
  - Authentication requirement
- ✅ Cart calculations
  - Total price accuracy
- ✅ User isolation
  - Cart privacy between users

**Total: 17 tests**

---

#### 3. **Order Creation Tests** (`orders.test.js`)
- ✅ Create order
  - Successful order creation
  - Cart clearing after order
  - Stock reduction after order
  - Empty cart rejection
  - Insufficient stock rejection
  - Order items creation
  - Authentication requirement
  - Race condition handling
- ✅ Get orders
  - Empty order history
  - Multiple orders retrieval
  - User-specific orders only
  - Authentication requirement
- ✅ Get order by ID
  - Single order with items
  - Non-existent order handling
  - Cross-user access prevention
  - Authentication requirement
- ✅ Order calculations
  - Total amount accuracy

**Total: 15 tests**

---

#### 4. **Payment Processing Tests** (`payment.test.js`)
- ✅ Create checkout session
  - Successful session creation
  - Empty cart rejection
  - Product availability validation
  - Server-side price calculation
  - Pending order creation
  - Cart preservation until payment
  - Stock preservation until payment
  - Authentication requirement
  - User email inclusion
- ✅ Checkout status
  - Status retrieval by session ID
  - Required parameter validation
  - Non-existent session handling
  - Cross-user access prevention
  - Authentication requirement
- ✅ Payment security
  - Price manipulation prevention
  - Stock validation at checkout
- ✅ Edge cases
  - Single item checkout
  - Multiple items checkout
  - Decimal price handling

**Total: 17 tests**

---

#### 5. **Stock Management Tests** (`stock-management.test.js`)
- ✅ Add to cart validation
  - Prevent exceeding stock
  - Allow within stock limit
  - Cumulative quantity validation
  - Exact stock quantity handling
- ✅ Update cart validation
  - Prevent updating beyond stock
  - Allow within stock limit
- ✅ Stock reduction
  - Single product order
  - Multiple products order
  - Insufficient stock prevention
- ✅ Edge cases
  - Zero stock handling
  - Last item handling
  - Concurrent updates (race conditions)
  - Negative stock prevention
- ✅ Stock display
  - Current stock in product details
  - Updated stock after orders
- ✅ Atomic operations
  - Transaction integrity

**Total: 15 tests**

---

## Total Phase 1 Tests: **79 tests**

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Test Environment
```bash
# Copy test environment template
cp .env.test.example .env.test

# Edit .env.test with your test database credentials
# IMPORTANT: Use a separate database for testing!
```

### 3. Create Test Database
```bash
# Create a separate test database
psql -U postgres -c "CREATE DATABASE ecommerce_test;"

# Initialize test database tables
NODE_ENV=test INIT_DB=true npm start
# (Stop the server after tables are created)
```

### 4. Run Tests

#### Run All Phase 1 Tests
```bash
npm run test:phase1
```

#### Run All Tests
```bash
npm test
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

#### Run Specific Test File
```bash
npm test -- __tests__/phase1/auth.test.js
```

---

## Test Structure

```
backend/
├── __tests__/
│   ├── setup.js                    # Test utilities and helpers
│   ├── phase1/
│   │   ├── auth.test.js           # Authentication tests
│   │   ├── cart.test.js           # Cart functionality tests
│   │   ├── orders.test.js         # Order creation tests
│   │   ├── payment.test.js        # Payment processing tests
│   │   └── stock-management.test.js # Stock management tests
│   └── README.md                   # This file
├── jest.config.js                  # Jest configuration
└── .env.test.example              # Test environment template
```

---

## Test Utilities (`setup.js`)

### Available Helper Functions

```javascript
// Database setup/teardown
setupTestDatabase()      // Clear all test data
teardownTestDatabase()   // Close database connections

// User creation
createTestUser(email, password, name)

// Product creation
createTestProduct(overrides)

// Order creation
createTestOrder(userId, total, status)

// Cart operations
addTestCartItem(userId, productId, quantity)

// Session handling
getSessionCookie(response)
```

---

## Key Testing Patterns

### 1. **Test Isolation**
Each test cleans up after itself to ensure independence.

### 2. **Authentication Flow**
```javascript
// Login pattern used across tests
const loginResponse = await request(app)
  .post('/api/auth/login')
  .send({ email, password });

const sessionCookie = getSessionCookie(loginResponse);

// Use cookie in subsequent requests
await request(app)
  .get('/api/cart')
  .set('Cookie', sessionCookie);
```

### 3. **Database Assertions**
```javascript
// Verify database state after operations
const result = await pool.query(
  'SELECT stock_quantity FROM products WHERE id = $1',
  [productId]
);
expect(result.rows[0].stock_quantity).toBe(expectedStock);
```

---

## Coverage Goals

### Current Phase 1 Coverage Targets:
- **Controllers**: 90%+
- **Models**: 95%+
- **Critical Paths**: 100%
  - Authentication
  - Cart operations
  - Order creation
  - Payment processing
  - Stock management

---

## Common Issues & Solutions

### Issue 1: Database Connection Errors
**Solution**: Ensure test database exists and connection string is correct in `.env.test`

### Issue 2: Tests Hanging
**Solution**: Check for unclosed database connections. Use `--detectOpenHandles` flag:
```bash
npm test -- --detectOpenHandles
```

### Issue 3: Stripe Tests Failing
**Solution**: Ensure you're using Stripe test mode keys (sk_test_...)

### Issue 4: Session Tests Failing
**Solution**: Verify SESSION_SECRET is set in `.env.test`

---

## Best Practices

### 1. **Use Descriptive Test Names**
```javascript
test('should reduce stock when order is created', async () => {
  // Test implementation
});
```

### 2. **Arrange-Act-Assert Pattern**
```javascript
test('example test', async () => {
  // Arrange: Set up test data
  const user = await createTestUser();
  
  // Act: Perform the operation
  const response = await request(app).get('/api/cart');
  
  // Assert: Verify the result
  expect(response.status).toBe(200);
});
```

### 3. **Test Edge Cases**
- Empty states
- Maximum values
- Boundary conditions
- Race conditions
- Error scenarios

### 4. **Keep Tests Fast**
- Use `beforeEach` for common setup
- Clear only necessary data
- Avoid unnecessary delays

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ecommerce_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: cd backend && npm install
      - run: cd backend && npm run test:phase1
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ecommerce_test
          SESSION_SECRET: test_secret
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
```

---

## Next Steps: Phase 2 & 3

### Phase 2 (Important - Should Have)
- Product endpoints tests
- Error handling tests
- Security tests
- Session management tests
- Database integrity tests

### Phase 3 (Nice to Have - Could Have)
- Performance tests
- E2E user journey tests
- Webhook retry logic tests
- Advanced edge cases

---

## Contributing

When adding new tests:
1. Follow existing patterns
2. Update this README
3. Ensure tests are isolated
4. Add descriptive names
5. Include edge cases
6. Update coverage reports

---

## Support

For issues or questions:
1. Check this README first
2. Review test output carefully
3. Check database connection
4. Verify environment variables
5. Review test utilities in `setup.js`

---

**Last Updated**: Phase 1 Implementation
**Status**: ✅ Ready for Production Testing
