import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Client-side validation
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API call
    setIsLoading(true);
    setApiError('');

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setApiError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <main className="w-full flex-auto">
      <div className="container py-12 sm:py-20">
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 max-w-md mx-auto shadow-md">
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight mb-3">Register</h1>
            <p className="text-sm text-text-secondary">Create an account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Error Message */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-medium text-text-primary mb-2 uppercase tracking-wide">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                disabled={isLoading}
                className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Your full name" 
              />
              {errors.name && <p className="text-primary text-xs mt-2">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-text-primary mb-2 uppercase tracking-wide">Email</label>
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
              <label htmlFor="password" className="block text-xs font-medium text-text-primary mb-2 uppercase tracking-wide">Password</label>
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

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-text-primary mb-2 uppercase tracking-wide">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange}
                disabled={isLoading}
                className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="******" 
              />
              {errors.confirmPassword && <p className="text-primary text-xs mt-2">{errors.confirmPassword}</p>}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 text-sm font-medium tracking-wide rounded-lg transition-all duration-300 mt-8 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </button>

            <p className="text-center text-sm text-text-secondary pt-4">
              Already have an account? <Link to="/login" className="text-primary hover:text-primary-dark font-medium cursor-pointer">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Register;
