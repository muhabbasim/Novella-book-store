# Frontend Testing Guide - Novella Book Store

## Overview

This testing suite provides **production-focused coverage** for critical customer scenarios using unit and component tests. The suite is minimal, deterministic, and focuses on genuine production risks.

## Test Structure

```
/Users/mugtabaali/Desktop/assignment/
├── src/test/
│   ├── setup.js                      # Vitest configuration
│   ├── test-utils.jsx                # Shared testing utilities
│   ├── unit/
│   │   └── cart.test.jsx             # Cart logic tests
│   └── component/
│       ├── auth.test.jsx             # Authentication tests
│       ├── checkout.test.jsx         # Checkout flow tests
│       └── products.test.jsx         # Product browsing tests
└── TEST_GUIDE.md                     # This file
```

## Technology Stack

- **Vitest** - Fast unit and component testing
- **React Testing Library** - Component testing without implementation details
- **jsdom** - Browser environment simulation

## Test Coverage by Scenario

### ✅ Scenario 1: Product Browsing
**Location**: `src/test/component/products.test.jsx`
- Products display correctly
- Product information is accurate
- Search filtering works
- Category filtering works

### ✅ Scenario 2: Shopping Cart
**Location**: `src/test/unit/cart.test.jsx`
- Add items to cart
- Update quantities
- Remove items
- Calculate totals correctly

### ✅ Scenario 3: Cart Persistence
**Location**: `src/test/unit/cart.test.jsx`
- localStorage persistence
- Cart restoration on page load
- Survives browser refresh

### ✅ Scenario 4: Authentication
**Location**: `src/test/component/auth.test.jsx`
- Registration flow
- Login flow
- Error handling
- Session persistence

### ✅ Scenario 5: Protected Routes
**Location**: `src/test/component/auth.test.jsx`
- Redirect unauthenticated users
- Allow authenticated access

### ✅ Scenario 6: Checkout Validation
**Location**: `src/test/component/checkout.test.jsx`
- Empty cart prevention
- Order summary accuracy

### ✅ Scenario 7: Stripe Checkout
**Location**: `src/test/component/checkout.test.jsx`
- Session creation
- Redirect to Stripe
- Cancellation handling

### ✅ Scenario 8: Order Confirmation
**Location**: `src/test/component/checkout.test.jsx`
- Payment verification
- Never trust frontend redirect
- Display order information
- Handle verification errors

### ✅ Scenario 10: Error Handling
**Location**: `src/test/component/checkout.test.jsx`
- API failures
- Loading states
- Error messages

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run All Tests
```bash
# Run all tests
npm test && npm run build
```

## Interactive Testing

### Vitest UI
```bash
npm run test:ui
```

### Run Single Test
```bash
npm test cart.test.jsx
```

## Test Philosophy

### What We Test
- **Critical user flows**: Registration, login, cart, checkout
- **Edge cases**: Empty states, error conditions
- **Business logic**: Cart calculations, price totals
- **Component behavior**: User interactions, state changes

### What We Don't Test
- Implementation details (private methods, state structure)
- Third-party libraries (React, React Router)
- Styling and CSS
- Content that's unlikely to break

### Testing Principles
- **Fast**: All tests run in < 5 seconds
- **Deterministic**: No flaky tests, no random data
- **Focused**: Test behavior, not implementation
- **Maintainable**: Clear test names, minimal setup

## Test Patterns

### Unit Tests

Unit tests focus on isolated logic without rendering components:

```javascript
import { describe, it, expect } from 'vitest';
import { calculateTotal } from '../utils/cart';

describe('Cart calculations', () => {
  it('calculates total correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 15, quantity: 1 }
    ];
    expect(calculateTotal(items)).toBe(35);
  });
});
```

### Component Tests

Component tests render components and test user interactions:

```javascript
import { render, screen, fireEvent } from '../test-utils';
import ProductCard from '../../components/ProductCard';

it('adds product to cart when button clicked', () => {
  render(<ProductCard product={mockProduct} />);
  
  const button = screen.getByRole('button', { name: /add to cart/i });
  fireEvent.click(button);
  
  expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
});
```

### Async Testing

For components that fetch data or have async behavior:

```javascript
it('loads and displays products', async () => {
  render(<Products />);
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  const products = await screen.findByText(/midnight library/i);
  expect(products).toBeInTheDocument();
});
```

## Backend Requirements

Some component tests interact with mocked API endpoints. The tests use MSW (Mock Service Worker) to intercept API calls in tests.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
```

## Debugging Tests

### Vitest Debugging

```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test cart.test.jsx

# Debug in VS Code
# Add breakpoint, then run "Debug: JavaScript Debug Terminal"
npm test
```

### Common Issues

**Tests fail but work in browser**
- Check if mocks are properly configured
- Verify test data matches production data
- Ensure `.env` file exists with `VITE_API_URL`

**Cart tests fail**
- Clear localStorage: `localStorage.clear()`
- Check if CartContext is properly wrapped

**Authentication tests fail**
- Verify API mocks return correct shape
- Check if AuthContext is wrapped in tests

## Best Practices

### DO:
- Test user behavior, not implementation
- Use accessible selectors (`getByRole`, `getByLabelText`)
- Keep tests simple and readable
- Mock external dependencies (API, localStorage)
- Test error states and edge cases

### DON'T:
- Test implementation details
- Make tests dependent on each other
- Test third-party libraries
- Ignore flaky tests

## Test Performance

### Current Performance
- **Unit tests**: ~2-5 seconds (all)
- **Component tests**: ~5-10 seconds (all)

### Optimization Tips
- Run unit tests in watch mode during development
- Use `.only` to focus on specific tests during debugging

## Test Data

### Mock Products
```javascript
const mockProduct = {
  id: 1,
  title: 'The Midnight Library',
  author: 'Matt Haig',
  price: 65.00,
  image: 'https://example.com/book.jpg',
  category: 'Fiction',
};
```

### Mock User
```javascript
const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
};
```

### Mock Cart
```javascript
const mockCart = [
  {
    id: 1,
    title: 'The Midnight Library',
    price: 65.00,
    quantity: 2,
  },
];
```

## Pre-Deployment Checklist

Before deploying:
- [ ] All unit tests pass
- [ ] All component tests pass
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in test runs

## Getting Help

If tests fail:
1. Check test output for error messages
2. Review this guide
3. Check Vitest documentation
4. Review test examples in the codebase

---

**Need Quick Start?** See [TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md)  
**Test Results?** See [TEST_RESULTS.md](./TEST_RESULTS.md)
