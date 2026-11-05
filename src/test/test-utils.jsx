import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(ui, options = {}) {
  const { route = '/', ...renderOptions } = options;

  // Set initial route if specified
  if (route !== '/') {
    window.history.pushState({}, 'Test page', route);
  }

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Create mock product for testing
 */
export function createMockProduct(overrides = {}) {
  return {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    description: 'Test description for a book',
    price: 50.00,
    image: 'https://example.com/book.jpg',
    category: 'Fiction',
    format: 'Paperback',
    pageCount: 300,
    stock_quantity: 10,
    bestseller: false,
    newArrival: false,
    ...overrides,
  };
}

/**
 * Create mock user for testing
 */
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
}

/**
 * Create mock cart item
 */
export function createMockCartItem(productOverrides = {}, quantity = 1) {
  return {
    product: createMockProduct(productOverrides),
    quantity,
  };
}

/**
 * Mock successful API response
 */
export function mockApiSuccess(data = {}) {
  return Promise.resolve({
    ok: true,
    json: async () => ({ success: true, ...data }),
  });
}

/**
 * Mock API error response
 */
export function mockApiError(message = 'An error occurred') {
  return Promise.resolve({
    ok: false,
    json: async () => ({ success: false, message }),
  });
}

/**
 * Wait for async operations
 */
export function waitFor(callback, options) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(callback());
    }, options?.timeout || 0);
  });
}

export * from '@testing-library/react';
