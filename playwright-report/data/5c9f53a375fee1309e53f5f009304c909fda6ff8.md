# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-journey.spec.js >> Critical Customer Journey >> Scenario 10: Error handling and loading states
- Location: e2e/critical-journey.spec.js:107:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - banner [ref=f1e4]:
    - generic [ref=f1e6]:
      - link "logo Novelle Book Store" [ref=f1e7] [cursor=pointer]:
        - /url: /
        - img "logo" [ref=f1e9]
        - generic [ref=f1e10]:
          - generic [ref=f1e11]: Novelle
          - generic [ref=f1e12]: Book Store
      - navigation [ref=f1e13]:
        - link "Home" [ref=f1e14] [cursor=pointer]:
          - /url: /
        - link [ref=f1e15] [cursor=pointer]:
          - /url: /cart
        - link "Login" [ref=f1e19] [cursor=pointer]:
          - /url: /login
  - main [ref=f1e21]:
    - generic [ref=f1e23]:
      - status [ref=f1e27]:
        - generic [aria-hidden] [ref=f1e28]: 📚
        - paragraph [ref=f1e29]: Unable to load book cover
      - generic [ref=f1e30]:
        - generic [ref=f1e31]:
          - heading [level=1]
          - paragraph [ref=f1e33]: by
        - paragraph
        - generic [ref=f1e34]: SAR NaN
        - generic [ref=f1e36]:
          - generic [ref=f1e37]:
            - generic [ref=f1e38]: Quantity
            - generic [ref=f1e39]:
              - button "Decrease quantity" [ref=f1e40] [cursor=pointer]: −
              - spinbutton "Quantity" [ref=f1e41]: "1"
              - button "Increase quantity" [ref=f1e42] [cursor=pointer]: +
          - generic [ref=f1e43]:
            - button "Add to Cart" [ref=f1e44] [cursor=pointer]
            - link "Continue Browsing" [ref=f1e45] [cursor=pointer]:
              - /url: /
  - contentinfo [ref=f1e48]:
    - generic [ref=f1e49]:
      - generic [ref=f1e50]:
        - generic [ref=f1e51]:
          - generic [ref=f1e52]: Novelle
          - paragraph [ref=f1e56]: Your destination for premium audio experiences and beautiful products.
        - generic [ref=f1e57]:
          - heading "Quick Links" [level=3] [ref=f1e58]
          - navigation [ref=f1e59]:
            - link "Home" [ref=f1e60] [cursor=pointer]:
              - /url: /
            - link "Shopping Cart" [ref=f1e61] [cursor=pointer]:
              - /url: /cart
            - link "Account" [ref=f1e62] [cursor=pointer]:
              - /url: /login
        - generic [ref=f1e63]:
          - heading "Categories" [level=3] [ref=f1e64]
          - navigation [ref=f1e65]:
            - generic [ref=f1e66]: Audio
            - generic [ref=f1e67]: Headphones
            - generic [ref=f1e68]: Earbuds
        - generic [ref=f1e69]:
          - heading "Contact" [level=3] [ref=f1e70]
          - generic [ref=f1e71]:
            - paragraph [ref=f1e72]: info@Novelle.com
            - paragraph [ref=f1e73]: +966 50 123 4567
      - generic [ref=f1e75]:
        - paragraph [ref=f1e76]: © 2026 Novelle. All rights reserved.
        - generic [ref=f1e77]:
          - generic [ref=f1e78] [cursor=pointer]: Privacy Policy
          - generic [ref=f1e79] [cursor=pointer]: Terms of Service
```

# Test source

```ts
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
  92  |     await expect(page.locator('h1, h2')).toContainText(/midnight|title/i, { timeout: 10000 });
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
> 126 |     expect(foundError).toBeTruthy();
      |                        ^ Error: expect(received).toBeTruthy()
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
  193 |     await page.goto('/');
  194 |     await page.waitForSelector('text=The Midnight Library', { timeout: 10000 });
  195 |     await page.click('text=The Midnight Library');
  196 |     await page.click('button:has-text("Add to Cart")');
  197 |     await page.click('a[href="/cart"]');
  198 | 
  199 |     // Now checkout should be enabled
  200 |     const enabledCheckoutBtn = page.locator('button:has-text("Checkout"), a:has-text("Checkout")').first();
  201 |     await expect(enabledCheckoutBtn).toBeVisible();
  202 |     
  203 |     // Note: Actual Stripe checkout requires authentication
  204 |     // The redirect will be tested in authenticated E2E scenarios
  205 |   });
  206 | 
  207 |   test('Scenario 7: Checkout cancellation', async ({ page }) => {
  208 |     // Navigate to cancel page
  209 |     await page.goto('/checkout/cancel');
  210 | 
  211 |     // Should show cancellation message or redirect to cart
  212 |     const cancelIndicators = [
  213 |       page.locator('text=/cancel/i'),
  214 |       page.locator('text=/cart/i'),
  215 |     ];
  216 | 
  217 |     let foundIndicator = false;
  218 |     for (const indicator of cancelIndicators) {
  219 |       if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
  220 |         foundIndicator = true;
  221 |         break;
  222 |       }
  223 |     }
  224 | 
  225 |     expect(foundIndicator || page.url().includes('cart') || page.url().includes('cancel')).toBeTruthy();
  226 |   });
```