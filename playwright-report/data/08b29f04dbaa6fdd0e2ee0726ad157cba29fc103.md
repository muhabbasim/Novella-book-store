# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-journey.spec.js >> Critical Customer Journey >> Scenario 3: Cart persistence across refresh
- Location: e2e/critical-journey.spec.js:50:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=The Midnight Library') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - link "logo Novelle Book Store" [ref=e7] [cursor=pointer]:
        - /url: /
        - img "logo" [ref=e9]
        - generic [ref=e10]:
          - generic [ref=e11]: Novelle
          - generic [ref=e12]: Book Store
      - navigation [ref=e13]:
        - link "Home" [ref=e14] [cursor=pointer]:
          - /url: /
        - link [ref=e15] [cursor=pointer]:
          - /url: /cart
        - link "Login" [ref=e19] [cursor=pointer]:
          - /url: /login
  - main [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e27]:
        - paragraph [ref=e28]: Error loading products
        - paragraph [ref=e29]: Failed to fetch
      - generic [ref=e33]:
        - generic [ref=e36]:
          - generic [ref=e37]: Curated Collection
          - heading "Find Your Next Favorite Book" [level=1] [ref=e41]:
            - text: Find Your Next
            - generic [ref=e42]: Favorite Book
          - paragraph [ref=e44]: Discover stories that stay with you, ideas that inspire you, and books worth returning to. Every page, a new adventure.
          - generic [ref=e45]:
            - link "Explore Books" [ref=e46] [cursor=pointer]:
              - /url: /#products
            - link "Browse Bestsellers" [ref=e49] [cursor=pointer]:
              - /url: /#products
          - generic [ref=e50]:
            - generic [ref=e51]: Free Shipping
            - generic [ref=e55]: Authentic Books
            - generic [ref=e59]: Curated Selection
        - img "Curated bookstore collection" [ref=e65]
      - generic [ref=e70]:
        - textbox "Search books" [ref=e75]:
          - /placeholder: Search by title, author, ISBN, or topic...
        - generic [ref=e76]:
          - generic [ref=e77]: "Filter by:"
          - generic [ref=e80]:
            - button "All" [ref=e81] [cursor=pointer]
            - button "Fiction" [ref=e82] [cursor=pointer]
            - button "Mystery" [ref=e83] [cursor=pointer]
            - button "Science Fiction" [ref=e84] [cursor=pointer]
            - button "Fantasy" [ref=e85] [cursor=pointer]
            - button "Business" [ref=e86] [cursor=pointer]
            - button "Technology" [ref=e87] [cursor=pointer]
            - button "Psychology" [ref=e88] [cursor=pointer]
            - button "History" [ref=e89] [cursor=pointer]
            - button "Self-Help" [ref=e90] [cursor=pointer]
            - button "Biography" [ref=e91] [cursor=pointer]
            - button "Science" [ref=e92] [cursor=pointer]
            - button "Philosophy" [ref=e93] [cursor=pointer]
            - button "Historical Fiction" [ref=e94] [cursor=pointer]
      - generic [ref=e97]:
        - heading "No books found" [level=2] [ref=e101]
        - paragraph [ref=e102]: We couldn't find any books matching your search. Try adjusting your filters or search terms.
        - button "Reset all filters" [ref=e103] [cursor=pointer]
  - contentinfo [ref=e106]:
    - generic [ref=e107]:
      - generic [ref=e108]:
        - generic [ref=e109]:
          - generic [ref=e110]: Novelle
          - paragraph [ref=e114]: Your destination for premium audio experiences and beautiful products.
        - generic [ref=e115]:
          - heading "Quick Links" [level=3] [ref=e116]
          - navigation [ref=e117]:
            - link "Home" [ref=e118] [cursor=pointer]:
              - /url: /
            - link "Shopping Cart" [ref=e119] [cursor=pointer]:
              - /url: /cart
            - link "Account" [ref=e120] [cursor=pointer]:
              - /url: /login
        - generic [ref=e121]:
          - heading "Categories" [level=3] [ref=e122]
          - navigation [ref=e123]:
            - generic [ref=e124]: Audio
            - generic [ref=e125]: Headphones
            - generic [ref=e126]: Earbuds
        - generic [ref=e127]:
          - heading "Contact" [level=3] [ref=e128]
          - generic [ref=e129]:
            - paragraph [ref=e130]: info@Novelle.com
            - paragraph [ref=e131]: +966 50 123 4567
      - generic [ref=e133]:
        - paragraph [ref=e134]: © 2026 Novelle. All rights reserved.
        - generic [ref=e135]:
          - generic [ref=e136] [cursor=pointer]: Privacy Policy
          - generic [ref=e137] [cursor=pointer]: Terms of Service
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
> 52  |     await page.waitForSelector('text=The Midnight Library', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
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
```