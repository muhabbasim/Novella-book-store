import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

/**
 * Context for authentication state and operations
 */
const AuthContext = createContext(null);

/**
 * Provider component that wraps the app and provides auth functionality
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status
   */
  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        setUser(response.user);
      }
    } catch (err) {
      // User not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      // Handle API-level failures (200 OK but success: false)
      const errorMessage = response.message || response.error || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Login user
   */
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      // Handle API-level failures (200 OK but success: false)
      const errorMessage = response.message || response.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
