# Frontend Testing Guide - Novella Book Store

## Overview

This testing suite provides **production-focused coverage** for the 10 most critical customer scenarios. The suite is minimal, deterministic, and focuses on genuine production risks.

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
├── e2e/
│   └── critical-journey.spec.js      # End-to-end customer journey
├── playwright.config.js              # Playwright configuration
└── TEST_GUIDE.md                     # This file
```

## Technology Stack

- **Vitest** - Fast unit and component testing
- **React Testing Library** - Component testing without implementation details
- **Playwright** - Reliable E2E testing for critical flows
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
**Location**: `src/test/unit/cart.test.jsx` + `e2e/critical-journey.spec.js`
- localStorage persistence
- Cart restoration on page load
- Survives browser refresh

### ✅ Scenario 4: Authentication
**Location**: `src/test/component/auth.test.jsx` + `e2e/critical-journey.spec.js`
- Registration flow
- Login flow
- Error handling
- Session persistence

### ✅ Scenario 5: Protected Routes
**Location**: `src/test/component/auth.test.jsx` + `e2e/critical-journey.spec.js`
- Redirect unauthenticated users
- Allow authenticated access

### ✅ Scenario 6: Checkout Validation
**Location**: `src/test/component/checkout.test.jsx` + `e2e/critical-journey.spec.js`
- Empty cart prevention
- Order summary accuracy

### ✅ Scenario 7: Stripe Checkout
**Location**: `src/test/component/checkout.test.jsx` + `e2e/critical-journey.spec.js`
- Session creation
- Redirect to Stripe
- Cancellation handling

### ✅ Scenario 8: Order Confirmation
**Location**: `src/test/component/checkout.test.jsx`
- Payment verification
- Never trust frontend redirect
- Display order information
- Handle verification errors

### ✅ Scenario 9: Navigation
**Location**: `e2e/critical-journey.spec.js`
- Direct URLs work
- Browser back/forward
- Page refresh maintains state

### ✅ Scenario 10: Error Handling
**Location**: `src/test/component/checkout.test.jsx` + `e2e/critical-journey.spec.js`
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
# Unit and component tests
npm test

# E2E tests (starts dev server automatically)
npm run test:e2e

# Run all tests
npm test && npm run test:e2e
```

### Interactive Test Modes
```bash
# Vitest UI (interactive test runner)
npm run test:ui

# Playwright UI (visual test debugging)
npm run test:e2e:ui

# Playwright headed mode (see browser)
npm run test:e2e:headed
```

### Watch Mode
```bash
# Watch unit tests during development
npm test -- --watch

# Watch specific test file
npm test -- cart.test.jsx --watch
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

## Environment Setup

### Required Environment Variables

Create `.env` file in the root:
```
VITE_API_URL=http://localhost:5001
```

### Backend Requirements

For full E2E testing, the backend must be running:
```bash
cd backend
npm install
npm run dev
```

The backend should be running on `http://localhost:5001`.

### Stripe Test Mode

E2E tests that interact with Stripe require:
- Backend Stripe webhook configured
- Use Stripe test card: `4242 4242 4242 4242`
- See `backend/docs/stripe-docs/STRIPE_SETUP.md`

## Test Patterns

### Unit Tests (Vitest)

```javascript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = createTestData();
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Component Tests (React Testing Library)

```javascript
import { renderWithProviders } from '../test-utils';

it('should render and interact', async () => {
  const user = userEvent.setup();
  renderWithProviders(<Component />);
  
  // Find elements
  const button = screen.getByRole('button', { name: /click me/i });
  
  // Interact
  await user.click(button);
  
  // Assert
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```javascript
test('complete user journey', async ({ page }) => {
  // Navigate
  await page.goto('/');
  
  // Interact
  await page.click('text=Product Name');
  await page.fill('input[name="email"]', 'test@example.com');
  
  // Assert
  await expect(page.locator('text=Success')).toBeVisible();
});
```

## Mock Strategy

### API Mocking

Unit and component tests mock the API layer:
```javascript
vi.mock('../../services/api', () => ({
  authAPI: {
    login: vi.fn(() => Promise.resolve({ success: true })),
  },
}));
```

### No Mocking in E2E

Playwright tests run against the real application with the real backend. This ensures production-like testing.

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
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: Run unit tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
```

## Debugging Tests

### Vitest Debugging
```bash
# Run single test file
npm test cart.test.jsx

# Run tests matching pattern
npm test -- -t "shopping cart"

# Show console.log output
npm test -- --reporter=verbose
```

### Playwright Debugging
```bash
# Visual debugging with Playwright Inspector
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npx playwright test --debug -g "checkout"

# View test report
npx playwright show-report
```

### Common Issues

**Tests fail with "API_URL not configured"**
- Ensure `.env` file exists with `VITE_API_URL`

**E2E tests timeout**
- Ensure dev server is running (`npm run dev`)
- Increase timeout in `playwright.config.js`

**Cart tests fail**
- Clear localStorage: Tests do this automatically
- Check if browser storage is available

**Authentication tests fail**
- Backend may not be running
- Check test user credentials
- Verify API endpoints

## Best Practices

### ✅ DO

- Test user behavior, not implementation
- Use semantic queries (role, label, text)
- Mock external dependencies
- Keep tests focused and isolated
- Test error states
- Verify loading states

### ❌ DON'T

- Test internal component state
- Use CSS selectors when semantic options exist
- Make tests dependent on each other
- Test third-party libraries
- Mock too much in E2E tests
- Ignore flaky tests

## Performance

### Typical Test Execution Times

- **Unit tests**: ~2-5 seconds (all)
- **Component tests**: ~5-10 seconds (all)
- **E2E tests**: ~30-60 seconds (all)

### Optimization Tips

- Run unit tests in watch mode during development
- Run E2E tests before committing
- Use `.only` to focus on specific tests during debugging
- Parallelize E2E tests in CI (Playwright handles this)

## Test Data

### Test Users
```javascript
{
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User'
}
```

### Test Products
Mock products are defined in `test-utils.jsx`:
```javascript
createMockProduct({
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  price: 50.00,
  stock_quantity: 10,
})
```

## Maintenance

### When to Update Tests

- After changing user-facing behavior
- After adding new features
- After fixing bugs (add regression test)
- After updating dependencies

### When NOT to Update Tests

- After refactoring (if behavior unchanged)
- After changing CSS classes
- After renaming variables
- After code formatting

## Production Deployment Checklist

Before deploying to production:

- [ ] All unit tests pass
- [ ] All component tests pass
- [ ] All E2E tests pass
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in test runs
- [ ] Test coverage is adequate for critical paths

## Support

For issues or questions:
1. Check test output for error messages
2. Review this guide
3. Check Playwright/Vitest documentation
4. Review test examples in the codebase

## Future Enhancements

Potential additions (not in current scope):
- Visual regression testing
- Performance testing
- Accessibility testing (automated)
- Load testing
- Cross-browser testing (Safari, Firefox)
- Mobile device testing

## Summary

This testing suite provides **lean, production-focused coverage** for the Novella Book Store application. It prioritizes:

1. **Critical user journeys** over exhaustive coverage
2. **Real user behavior** over implementation details
3. **Deterministic tests** over flaky tests
4. **Fast feedback** over comprehensive suites
5. **Production confidence** over test metrics

Run tests frequently, keep them passing, and expand coverage only when genuine production risks are identified.
