import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';

// Mock the API
vi.mock('../../services/api', () => ({
  cartAPI: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
  authAPI: {
    getCurrentUser: vi.fn(() => Promise.reject(new Error('Not authenticated'))),
  },
}));

const wrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('Shopping Cart - Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Scenario 2: Shopping cart operations', () => {
    it('should add items to cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const mockProduct = {
        id: 1,
        name: 'Test Book',
        price: 50.0,
        stock_quantity: 10,
      };

      await act(async () => {
        await result.current.addToCart(mockProduct, 2);
      });

      await waitFor(() => {
        expect(result.current.cartItems).toHaveLength(1);
        expect(result.current.cartItems[0].product.id).toBe(1);
        expect(result.current.cartItems[0].quantity).toBe(2);
        expect(result.current.totalCartCount).toBe(2);
      });
    });

    it('should update item quantity', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const mockProduct = {
        id: 1,
        name: 'Test Book',
        price: 50.0,
        stock_quantity: 10,
      };

      await act(async () => {
        await result.current.addToCart(mockProduct, 2);
      });

      await waitFor(() => {
        expect(result.current.cartItems[0].quantity).toBe(2);
      });

      await act(async () => {
        await result.current.updateQuantity(1, 5);
      });

      await waitFor(() => {
        expect(result.current.cartItems[0].quantity).toBe(5);
        expect(result.current.totalCartCount).toBe(5);
      });
    });

    it('should remove items from cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const mockProduct = {
        id: 1,
        name: 'Test Book',
        price: 50.0,
      };

      await act(async () => {
        await result.current.addToCart(mockProduct, 1);
      });

      await waitFor(() => {
        expect(result.current.cartItems).toHaveLength(1);
      });

      await act(async () => {
        await result.current.removeItem(1);
      });

      await waitFor(() => {
        expect(result.current.cartItems).toHaveLength(0);
        expect(result.current.totalCartCount).toBe(0);
      });
    });

    it('should calculate correct totals', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const mockProduct1 = { id: 1, name: 'Book 1', price: 50.0 };
      const mockProduct2 = { id: 2, name: 'Book 2', price: 30.0 };

      await act(async () => {
        await result.current.addToCart(mockProduct1, 2);
        await result.current.addToCart(mockProduct2, 1);
      });

      await waitFor(() => {
        expect(result.current.totalCartCount).toBe(3);
        expect(result.current.totalPrice).toBe(130.0); // (50 * 2) + (30 * 1)
      });
    });
  });

  describe('Scenario 3: Cart persistence', () => {
    it('should persist cart in localStorage for guest users', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const mockProduct = {
        id: 1,
        name: 'Test Book',
        price: 50.0,
      };

      await act(async () => {
        await result.current.addToCart(mockProduct, 1);
      });

      await waitFor(() => {
        const savedCart = localStorage.getItem('guest_cart');
        expect(savedCart).toBeTruthy();
        const parsedCart = JSON.parse(savedCart);
        expect(parsedCart).toHaveLength(1);
        expect(parsedCart[0].product.id).toBe(1);
      });
    });

    it('should restore cart from localStorage on mount', async () => {
      const mockCartData = [
        {
          product: { id: 1, name: 'Book 1', price: 50.0 },
          quantity: 2,
        },
      ];

      localStorage.setItem('guest_cart', JSON.stringify(mockCartData));

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.cartItems).toHaveLength(1);
        expect(result.current.cartItems[0].product.id).toBe(1);
        expect(result.current.cartItems[0].quantity).toBe(2);
      });
    });
  });
});
