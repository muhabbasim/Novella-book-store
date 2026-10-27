/**
 * API Service for backend communication
 * All API calls go through this service
 */

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL environment variable is not configured.");
}

/**
 * Base fetch wrapper with credentials
 */
const fetchAPI = async (endpoint, options = {}) => {
  const config = {
    ...options,
    credentials: 'include', // Send cookies with requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  /**
   * Register new user
   */
  register: async (userData) => {
    return fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    return fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Logout user
   */
  logout: async () => {
    return fetchAPI('/api/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return fetchAPI('/api/auth/me');
  },
};

// ============================================
// PRODUCTS API
// ============================================

export const productsAPI = {
  /**
   * Get all products with optional filters
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    
    const query = params.toString();
    return fetchAPI(`/api/products${query ? `?${query}` : ''}`);
  },

  /**
   * Get single product by ID
   */
  getById: async (id) => {
    return fetchAPI(`/api/products/${id}`);
  },

  /**
   * Get products by category
   */
  getByCategory: async (category) => {
    return fetchAPI(`/api/products/category/${category}`);
  },

  /**
   * Search products
   */
  search: async (query) => {
    return fetchAPI(`/api/products/search?q=${encodeURIComponent(query)}`);
  },
};

// ============================================
// CART API
// ============================================

export const cartAPI = {
  /**
   * Get user's cart
   */
  getCart: async () => {
    return fetchAPI('/api/cart');
  },

  /**
   * Add item to cart
   */
  addItem: async (productId, quantity = 1) => {
    return fetchAPI('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  /**
   * Update cart item quantity
   */
  updateItem: async (productId, quantity) => {
    return fetchAPI(`/api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  /**
   * Remove item from cart
   */
  removeItem: async (productId) => {
    return fetchAPI(`/api/cart/${productId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    return fetchAPI('/api/cart', {
      method: 'DELETE',
    });
  },
};

// ============================================
// ORDERS API
// ============================================

export const ordersAPI = {
  /**
   * Create order (checkout)
   */
  createOrder: async () => {
    return fetchAPI('/api/orders', {
      method: 'POST',
    });
  },

  /**
   * Get user's order history
   */
  getOrders: async () => {
    return fetchAPI('/api/orders');
  },

  /**
   * Get single order by ID
   */
  getOrderById: async (id) => {
    return fetchAPI(`/api/orders/${id}`);
  },
};

// ============================================
// USER API
// ============================================

export const userAPI = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    return fetchAPI('/api/users/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData) => {
    return fetchAPI('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// ============================================
// CHECKOUT API (Stripe Integration)
// ============================================

export const checkoutAPI = {
  /**
   * Create Stripe Checkout Session
   * Returns sessionUrl to redirect user to Stripe
   */
  createCheckoutSession: async () => {
    return fetchAPI('/api/checkout', {
      method: 'POST',
    });
  },

  /**
   * Get checkout status by Stripe session ID
   * Used by success page to verify payment
   */
  getCheckoutStatus: async (sessionId) => {
    return fetchAPI(`/api/checkout/status?session_id=${sessionId}`);
  },
};
