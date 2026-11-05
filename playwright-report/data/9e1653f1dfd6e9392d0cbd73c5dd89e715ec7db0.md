# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-journey.spec.js >> Critical Customer Journey >> Scenario 9: Navigation and routing
- Location: e2e/critical-journey.spec.js:89:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1, h2')
Expected pattern: /midnight|title/i
Received string:  ""
Timeout: 10000ms

Call log:
  - Expect "toContainText" locator('h1, h2') with timeout 10000ms
  - waiting for locator('h1, h2')
    23 × locator resolved to <h1 class="text-3xl sm:text-4xl lg:text-5xl font-semibold text-text-primary tracking-tight leading-tight"></h1>
       - unexpected value ""

```

```yaml
- banner:
  - link "logo Novelle Book Store":
    - /url: /
    - img "logo"
    - text: Novelle Book Store
  - navigation:
    - link "Home":
      - /url: /
    - link:
      - /url: /cart
      - img
    - link "Login":
      - /url: /login
- main:
  - status:
    - paragraph: Unable to load book cover
  - heading [level=1]
  - paragraph: by
  - paragraph
  - text: SAR NaN Quantity
  - button "Decrease quantity": −
  - spinbutton "Quantity": "1"
  - button "Increase quantity": +
  - button "Add to Cart"
  - link "Continue Browsing":
    - /url: /
    - img
    - text: Continue Browsing
- contentinfo:
  - text: Novelle
  - paragraph: Your destination for premium audio experiences and beautiful products.
  - heading "Quick Links" [level=3]
  - navigation:
    - link "Home":
      - /url: /
    - link "Shopping Cart":
      - /url: /cart
    - link "Account":
      - /url: /login
  - heading "Categories" [level=3]
  - navigation: Audio Headphones Earbuds
  - heading "Contact" [level=3]
  - paragraph: info@Novelle.com
  - paragraph: +966 50 123 4567
  - paragraph: © 2026 Novelle. All rights reserved.
  - text: Privacy Policy Terms of Service
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Critical Customer Journey E2E Tests
  5   |  * Tests the complete flow from browsing to checkout
  6   |  */
  7   | 
  8   | const TEST_USER = {
  9   |   email: `test-${Date.now()}@example.com`,
  10  |   password: 'TestPassword123!',
  11  |   name: 'Test User',
  12  | };
  13  | 
  14  | test.describe('Critical Customer Journey', () => {
  15  |   test.beforeEach(async ({ page }) => {
  16  |     await page.goto('/');
  17  |   });
  18  | 
  19  |   test('Scenario 1 & 2: Browse products and add to cart', async ({ page }) => {
  20  |     // Wait for products to load
  21  |     await page.waitForSelector('text=The Midnight Library', { timeout: 10000 });
  22  | 
  23  |     // Verify products are displayed
  24  |     await expect(page.locator('text=The Midnight Library')).toBeVisible();
  25  |     await expect(page.locator('text=Matt Haig')).toBeVisible();
  26  | 
  27  |     // Click on a product
  28  |     await page.click('text=The Midnight Library');
  29  | 
  30  |     // Verify product details page
  31  |     await expect(page).toHaveURL(/\/product\/\d+/);
  32  |     await expect(page.locator('text=The Midnight Library')).toBeVisible();
  33  | 
  34  |     // Add to cart
  35  |     const addToCartButton = page.locator('button:has-text("Add to Cart")');
  36  |     await expect(addToCartButton).toBeVisible();
  37  |     await addToCartButton.click();
  38  | 
  39  |     // Verify cart count updated
  40  |     await expect(page.locator('text=/\\d+/')).toBeVisible({ timeout: 5000 });
  41  | 
  42  |     // Go to cart
  43  |     await page.click('a[href="/cart"]');
  44  |     await expect(page).toHaveURL('/cart');
  45  | 
  46  |     // Verify item in cart
  47  |     await expect(page.locator('text=The Midnight Library')).toBeVisible();
  48  |   });
  49  | 
  50  |   test('Scenario 3: Cart persistence across refresh', async ({ page }) => {
  51  |     // Add item to cart
  52  |     await page.waitForSelector('text=The Midnight Library', { timeout: 10000 });
  53  |     await page.click('text=The Midnight Library');
  54  |     await page.click('button:has-text("Add to Cart")');
  55  | 
  56  |     // Wait for cart to update
  57  |     await page.waitForTimeout(1000);
  58  | 
  59  |     // Refresh the page
  60  |     await page.reload();
  61  | 
  62  |     // Go to cart
  63  |     await page.click('a[href="/cart"]');
  64  | 
  65  |     // Verify item still in cart
  66  |     await expect(page.locator('text=The Midnight Library')).toBeVisible();
  67  |   });
  68  | 
  69  |   test('Scenario 2: Update cart quantities', async ({ page }) => {
  70  |     // Add item to cart
  71  |     await page.waitForSelector('text=Atomic Habits', { timeout: 10000 });
  72  |     await page.click('text=Atomic Habits');
  73  |     await page.click('button:has-text("Add to Cart")');
  74  | 
  75  |     // Go to cart
  76  |     await page.click('a[href="/cart"]');
  77  | 
  78  |     // Find quantity controls
  79  |     const increaseButton = page.locator('button[aria-label*="Increase"], button:has-text("+")').first();
  80  |     
  81  |     // Increase quantity
  82  |     await increaseButton.click();
  83  |     await page.waitForTimeout(500);
  84  | 
  85  |     // Verify quantity increased (look for quantity 2)
  86  |     await expect(page.locator('text=/quantity.*2/i, input[value="2"]').first()).toBeVisible({ timeout: 3000 });
  87  |   });
  88  | 
  89  |   test('Scenario 9: Navigation and routing', async ({ page }) => {
  90  |     // Test direct URL access
  91  |     await page.goto('/product/1');
> 92  |     await expect(page.locator('h1, h2')).toContainText(/midnight|title/i, { timeout: 10000 });
      |                                          ^ Error: expect(locator).toContainText(expected) failed
  93  | 
  94  |     // Test browser back button
  95  |     await page.goBack();
  96  |     await expect(page).toHaveURL('/');
  97  | 
  98  |     // Test browser forward button
  99  |     await page.goForward();
  100 |     await expect(page).toHaveURL('/product/1');
  101 | 
  102 |     // Test page refresh maintains state
  103 |     await page.reload();
  104 |     await expect(page).toHaveURL('/product/1');
  105 |   });
  106 | 
  107 |   test('Scenario 10: Error handling and loading states', async ({ page }) => {
  108 |     // Navigate to non-existent product
  109 |     await page.goto('/product/99999');
  110 |     
  111 |     // Should show error or not found state
  112 |     const errorIndicators = [
  113 |       page.locator('text=/not found/i'),
  114 |       page.locator('text=/error/i'),
  115 |       page.locator('text=/doesn\'t exist/i'),
  116 |     ];
  117 | 
  118 |     let foundError = false;
  119 |     for (const indicator of errorIndicators) {
  120 |       if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
  121 |         foundError = true;
  122 |         break;
  123 |       }
  124 |     }
  125 | 
  126 |     expect(foundError).toBeTruthy();
  127 |   });
  128 | });
  129 | 
  130 | test.describe('Authentication Flow', () => {
  131 |   test('Scenario 4 & 5: Registration, login, and protected routes', async ({ page }) => {
  132 |     await page.goto('/');
  133 | 
  134 |     // Try to access protected route (orders)
  135 |     await page.goto('/orders');
  136 | 
  137 |     // Should redirect to login
  138 |     await expect(page).toHaveURL('/login', { timeout: 5000 });
  139 | 
  140 |     // Go to register page
  141 |     await page.click('text=/sign up|register|create account/i');
  142 |     await expect(page).toHaveURL('/register');
  143 | 
  144 |     // Fill registration form
  145 |     await page.fill('input[name="name"], input[placeholder*="name" i]', TEST_USER.name);
  146 |     await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
  147 |     await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
  148 | 
  149 |     // Submit registration
  150 |     await page.click('button[type="submit"]:has-text("Sign Up"), button:has-text("Register"), button:has-text("Create")');
  151 | 
  152 |     // Wait for redirect after successful registration
  153 |     await page.waitForURL(/\/(|home|orders)/, { timeout: 10000 }).catch(() => {
  154 |       // Registration might show error if backend not running in test mode
  155 |       console.log('Registration completed (backend may not be available)');
  156 |     });
  157 | 
  158 |     // Test logout (if logged in)
  159 |     const logoutButton = page.locator('text=/log ?out|sign ?out/i');
  160 |     if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
  161 |       await logoutButton.click();
  162 |       await page.waitForTimeout(500);
  163 |     }
  164 | 
  165 |     // Test login
  166 |     await page.goto('/login');
  167 |     await page.fill('input[type="email"]', TEST_USER.email);
  168 |     await page.fill('input[type="password"]', TEST_USER.password);
  169 |     await page.click('button[type="submit"]:has-text("Sign In"), button:has-text("Log In"), button:has-text("Login")');
  170 | 
  171 |     // Should redirect after login
  172 |     await page.waitForTimeout(2000);
  173 |   });
  174 | });
  175 | 
  176 | test.describe('Checkout Flow', () => {
  177 |   test('Scenario 6 & 7: Checkout validation and Stripe redirect', async ({ page }) => {
  178 |     await page.goto('/cart');
  179 | 
  180 |     // Test empty cart checkout prevention
  181 |     const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Proceed"), a:has-text("Checkout")');
  182 |     
  183 |     if (await checkoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
  184 |       // If checkout button exists with empty cart, it should be disabled or show warning
  185 |       const isDisabled = await checkoutButton.isDisabled().catch(() => false);
  186 |       expect(isDisabled).toBeTruthy();
  187 |     } else {
  188 |       // No checkout button shown for empty cart (valid approach)
  189 |       expect(true).toBeTruthy();
  190 |     }
  191 | 
  192 |     // Add item to cart first
```