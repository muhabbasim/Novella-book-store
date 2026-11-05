# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-journey.spec.js >> Checkout Flow >> Scenario 6 & 7: Checkout validation and Stripe redirect
- Location: e2e/critical-journey.spec.js:177:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=The Midnight Library') to be visible

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
    - generic [ref=f1e22]:
      - generic [ref=f1e27]:
        - paragraph [ref=f1e28]: Error loading products
        - paragraph [ref=f1e29]: Failed to fetch
      - generic [ref=f1e33]:
        - generic [ref=f1e36]:
          - generic [ref=f1e37]: Curated Collection
          - heading "Find Your Next Favorite Book" [level=1] [ref=f1e41]:
            - text: Find Your Next
            - generic [ref=f1e42]: Favorite Book
          - paragraph [ref=f1e44]: Discover stories that stay with you, ideas that inspire you, and books worth returning to. Every page, a new adventure.
          - generic [ref=f1e45]:
            - link "Explore Books" [ref=f1e46] [cursor=pointer]:
              - /url: /#products
            - link "Browse Bestsellers" [ref=f1e49] [cursor=pointer]:
              - /url: /#products
          - generic [ref=f1e50]:
            - generic [ref=f1e51]: Free Shipping
            - generic [ref=f1e55]: Authentic Books
            - generic [ref=f1e59]: Curated Selection
        - img "Curated bookstore collection" [ref=f1e65]
      - generic [ref=f1e70]:
        - textbox "Search books" [ref=f1e75]:
          - /placeholder: Search by title, author, ISBN, or topic...
        - generic [ref=f1e76]:
          - generic [ref=f1e77]: "Filter by:"
          - generic [ref=f1e80]:
            - button "All" [ref=f1e81] [cursor=pointer]
            - button "Fiction" [ref=f1e82] [cursor=pointer]
            - button "Mystery" [ref=f1e83] [cursor=pointer]
            - button "Science Fiction" [ref=f1e84] [cursor=pointer]
            - button "Fantasy" [ref=f1e85] [cursor=pointer]
            - button "Business" [ref=f1e86] [cursor=pointer]
            - button "Technology" [ref=f1e87] [cursor=pointer]
            - button "Psychology" [ref=f1e88] [cursor=pointer]
            - button "History" [ref=f1e89] [cursor=pointer]
            - button "Self-Help" [ref=f1e90] [cursor=pointer]
            - button "Biography" [ref=f1e91] [cursor=pointer]
            - button "Science" [ref=f1e92] [cursor=pointer]
            - button "Philosophy" [ref=f1e93] [cursor=pointer]
            - button "Historical Fiction" [ref=f1e94] [cursor=pointer]
      - generic [ref=f1e97]:
        - heading "No books found" [level=2] [ref=f1e101]
        - paragraph [ref=f1e102]: We couldn't find any books matching your search. Try adjusting your filters or search terms.
        - button "Reset all filters" [ref=f1e103] [cursor=pointer]
  - contentinfo [ref=f1e106]:
    - generic [ref=f1e107]:
      - generic [ref=f1e108]:
        - generic [ref=f1e109]:
          - generic [ref=f1e110]: Novelle
          - paragraph [ref=f1e114]: Your destination for premium audio experiences and beautiful products.
        - generic [ref=f1e115]:
          - heading "Quick Links" [level=3] [ref=f1e116]
          - navigation [ref=f1e117]:
            - link "Home" [ref=f1e118] [cursor=pointer]:
              - /url: /
            - link "Shopping Cart" [ref=f1e119] [cursor=pointer]:
              - /url: /cart
            - link "Account" [ref=f1e120] [cursor=pointer]:
              - /url: /login
        - generic [ref=f1e121]:
          - heading "Categories" [level=3] [ref=f1e122]
          - navigation [ref=f1e123]:
            - generic [ref=f1e124]: Audio
            - generic [ref=f1e125]: Headphones
            - generic [ref=f1e126]: Earbuds
        - generic [ref=f1e127]:
          - heading "Contact" [level=3] [ref=f1e128]
          - generic [ref=f1e129]:
            - paragraph [ref=f1e130]: info@Novelle.com
            - paragraph [ref=f1e131]: +966 50 123 4567
      - generic [ref=f1e133]:
        - paragraph [ref=f1e134]: © 2026 Novelle. All rights reserved.
        - generic [ref=f1e135]:
          - generic [ref=f1e136] [cursor=pointer]: Privacy Policy
          - generic [ref=f1e137] [cursor=pointer]: Terms of Service
```

# Test source

```ts
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
  193 |     await page.goto('/');
> 194 |     await page.waitForSelector('text=The Midnight Library', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
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
  227 | });
  228 | 
```