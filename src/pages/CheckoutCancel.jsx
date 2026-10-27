import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';

/**
 * Checkout Cancel Page
 * Shown when user cancels Stripe Checkout
 * Cart items are preserved so they can retry
 */
function CheckoutCancel() {
  const navigate = useNavigate();
  const { cartItems, totalPrice } = useCartContext();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <main className="w-full flex-auto bg-warm">
      <div className="container py-12 sm:py-16 lg:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary mb-2">
              Checkout Cancelled
            </h1>
            <p className="text-text-secondary">
              Your payment was not completed. Your cart has been saved.
            </p>
          </div>

          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h2>
              
              <div className="space-y-4 mb-4">
                {cartItems.slice(0, 3).map((item) => {
                  const price = typeof item.product.price === 'string' 
                    ? parseFloat(item.product.price) 
                    : item.product.price;

                  return (
                    <div key={item.product.id} className="flex gap-3 items-center">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded bg-warm-ivory"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Qty: {item.quantity} × {formatCurrency(price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {cartItems.length > 3 && (
                  <p className="text-sm text-text-tertiary text-center">
                    + {cartItems.length - 3} more {cartItems.length - 3 === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-text-primary">
                    Cart Total
                  </span>
                  <span className="text-xl font-semibold text-primary">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-blue-900 mb-3">What happened?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span>💡</span>
                <span>You cancelled the payment or closed the checkout page</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>No charges were made to your payment method</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🛒</span>
                <span>Your cart items are saved and ready when you want to checkout again</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="flex-1 bg-white hover:bg-warm-ivory border border-border text-text-primary py-3 px-6 rounded-lg transition-colors font-medium"
            >
              Review Cart
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-white hover:bg-warm-ivory border border-border text-text-primary py-3 px-6 rounded-lg transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center text-sm text-text-secondary">
            <p className="mb-2">Need help with checkout?</p>
            <button
              onClick={() => navigate('/cart')}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CheckoutCancel;
