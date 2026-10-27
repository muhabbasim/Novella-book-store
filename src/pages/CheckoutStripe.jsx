import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import { checkoutAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Stripe Checkout Page
 * Displays order summary and redirects to Stripe for payment
 */
function CheckoutStripe() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totalPrice } = useCartContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Handle checkout - redirect to Stripe
  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      setError('');

      // Create Stripe Checkout Session
      const response = await checkoutAPI.createCheckoutSession();

      if (response.success && response.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = response.sessionUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to initiate checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <main className="w-full flex-auto bg-warm">
      <div className="container py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary mb-2">
            Checkout
          </h1>
          <p className="text-text-secondary">
            Review your order and proceed to payment
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg mb-6 text-sm animate-fade-in max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Main layout */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-sm">
            {/* Order Summary */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Order Summary
              </h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const price = typeof item.product.price === 'string' 
                    ? parseFloat(item.product.price) 
                    : item.product.price;
                  const lineTotal = price * item.quantity;

                  return (
                    <div key={item.product.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg bg-warm-ivory"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-text-primary mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-text-secondary capitalize mb-1">
                          {item.product.category}
                        </p>
                        <p className="text-sm text-text-tertiary">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-text-primary">
                          {formatCurrency(lineTotal)}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {formatCurrency(price)} each
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary font-medium">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="text-text-primary font-medium">
                    Free
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-border">
                  <span className="text-text-primary">Total</span>
                  <span className="text-primary">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            {user && (
              <div className="mb-6 p-4 bg-warm-ivory rounded-lg">
                <h3 className="text-sm font-medium text-text-primary mb-2">
                  Order will be placed for:
                </h3>
                <p className="text-sm text-text-secondary">
                  {user.name} • {user.email}
                </p>
              </div>
            )}

            {/* Stripe Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    Secure Payment with Stripe
                  </h3>
                  <p className="text-xs text-blue-700">
                    You'll be redirected to Stripe's secure payment page. Your payment information is never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary-dark text-white py-4 text-base font-medium tracking-wide rounded-lg transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="small" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <span>Proceed to Payment</span>
                  <span>→</span>
                </>
              )}
            </button>

            {/* Additional Info */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/cart')}
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CheckoutStripe;
