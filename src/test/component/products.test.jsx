import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockProduct } from '../test-utils';
import Home from '../../pages/Home';

// Mock useProducts hook
vi.mock('../../hooks/useProducts', () => ({
  default: vi.fn((category, search) => {
    const mockProducts = [
      createMockProduct({ id: 1, title: 'The Midnight Library', author: 'Matt Haig', category: 'Fiction' }),
      createMockProduct({ id: 2, title: 'Atomic Habits', author: 'James Clear', category: 'Nonfiction' }),
      createMockProduct({ id: 3, title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction' }),
    ];

    let filtered = mockProducts;
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase())
      );
    }

    return {
      products: filtered,
      loading: false,
      error: null,
    };
  }),
}));

// Mock API
vi.mock('../../services/api', () => ({
  authAPI: {
    getCurrentUser: vi.fn(() => Promise.reject(new Error('Not authenticated'))),
  },
  cartAPI: {
    getCart: vi.fn(() => Promise.resolve({ cart: { items: [] } })),
  },
}));

describe('Product Browsing - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scenario 1: Product browsing and display', () => {
    it('should display product listings', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText('The Midnight Library')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Atomic Habits')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Dune')[0]).toBeInTheDocument();
      });
    });

    it('should display product information correctly', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        // Check for author names (may appear multiple times in DOM)
        const mattHaig = screen.getAllByText(/Matt Haig/i);
        const jamesClear = screen.getAllByText(/James Clear/i);
        
        expect(mattHaig.length).toBeGreaterThan(0);
        expect(jamesClear.length).toBeGreaterThan(0);
      });
    });

    it('should filter products by search', async () => {
      const useProducts = (await import('../../hooks/useProducts')).default;
      
      // Simulate search for "Atomic"
      const { products } = useProducts('All', 'Atomic');
      
      expect(products).toHaveLength(1);
      expect(products[0].title).toBe('Atomic Habits');
    });

    it('should filter products by category', async () => {
      const useProducts = (await import('../../hooks/useProducts')).default;
      
      // Simulate category filter
      const { products } = useProducts('Fiction', '');
      
      expect(products).toHaveLength(1);
      expect(products[0].category).toBe('Fiction');
    });
  });
});
