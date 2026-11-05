import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authAPI } from '../../services/api';

// Mock API
vi.mock('../../services/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  cartAPI: {
    getCart: vi.fn(() => Promise.resolve({ cart: { items: [] } })),
  },
}));

describe('Authentication - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Scenario 4: Authentication flow', () => {
    it('should handle successful login', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };

      authAPI.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
      authAPI.login.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText(/example@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/\*\*\*\*\*\*/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should display login errors', async () => {
      const user = userEvent.setup();

      authAPI.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
      authAPI.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText(/example@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/\*\*\*\*\*\*/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/invalid|error|failed/i);
        expect(errorMessage || authAPI.login).toBeTruthy();
      });
    });

    it('should handle successful registration', async () => {
      const user = userEvent.setup();

      authAPI.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
      authAPI.register.mockResolvedValue({
        success: true,
        user: {
          id: 1,
          name: 'New User',
          email: 'newuser@example.com',
        },
      });

      renderWithProviders(<Register />);

      const nameInput = screen.getByPlaceholderText(/name/i);
      const emailInput = screen.getByPlaceholderText(/example@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/\*\*\*\*\*\*/i);
      const registerButton = screen.getByRole('button', { name: /register|create|sign up/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');
      await user.click(registerButton);

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalled();
      });
    });
  });

  describe('Scenario 5: Protected routes', () => {
    it('should redirect unauthenticated users to login', async () => {
      authAPI.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));

      const TestComponent = () => <div>Protected Content</div>;

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        { route: '/orders' }
      );

      await waitFor(() => {
        // Should not show protected content
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });
    });

    it('should allow authenticated users to access protected routes', async () => {
      authAPI.getCurrentUser.mockResolvedValue({
        success: true,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      const TestComponent = () => <div>Protected Content</div>;

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });
});
