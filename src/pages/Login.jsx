import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Get redirect message from location state
  const redirectMessage = location.state?.message;

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Client-side validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API call
    setIsLoading(true);
    setApiError('');

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (result.success) {
      // Redirect back to the page they came from or home
      const from = location.state?.from || '/';
      navigate(from);
    } else {
      setApiError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <main className="w-full flex-auto">
      <div className="container py-12 sm:py-20">
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 max-w-md mx-auto shadow-md">
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight mb-3">Login</h1>
            <p className="text-sm text-text-secondary">Login to continue shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Redirect Message (e.g., from cart checkout) */}
            {redirectMessage && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                {redirectMessage}
              </div>
            )}

            {/* API Error Message */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-text-primary mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="example@example.com"
              />
              {errors.email && <p className="text-primary text-xs mt-2">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-text-primary mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="******"
              />
              {errors.password && <p className="text-primary text-xs mt-2">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 text-sm font-medium tracking-wide rounded-lg transition-all duration-300 mt-8 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <p className="text-center text-sm text-text-secondary pt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-dark font-medium cursor-pointer">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Login;
