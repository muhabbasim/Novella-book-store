import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkoutAPI } from '../services/api';
import { useCartContext } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Checkout Success Page
 * Handles return from Stripe Checkout after successful payment
 * Verifies payment status with backend before showing success
 */
function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchCart } = useCartContext();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, pending, error
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const sessionId = searchParams.get('session_id');
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('Invalid checkout session. No session ID provided.');
      return;
    }

    verifyPayment();
  }, [sessionId, retryCount]);

  const verifyPayment = async () => {
    try {
      const response = await checkoutAPI.getCheckoutStatus(sessionId);

      if (response.success && response.order) {
        const orderData = response.order;

        // Check payment status
        if (orderData.paymentStatus === 'paid') {
          setOrder(orderData);
          setStatus('success');
          // Refresh cart to clear it
          await fetchCart();
        } else if (orderData.paymentStatus === 'pending' && retryCount < maxRetries) {
          // Payment is still processing, retry after delay
          setStatus('pending');
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, retryDelay);
        } else if (orderData.paymentStatus === 'pending' && retryCount >= maxRetries) {
          // Max retries reached, show pending state
          setOrder(orderData);
          setStatus('pending');
        } else {
          // Payment failed or other status
          setStatus('error');
          setError(`Payment ${orderData.paymentStatus}. Please contact support if you were charged.`);
        }
      } else {
        throw new Error('Failed to verify payment status');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      
      // Retry on error if under max retries
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, retryDelay);
      } else {
        setStatus('error');
        setError(err.message || 'Failed to verify payment. Please contact support with your order details.');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Verifying state
  if (status === 'verifying') {
    return (
      <main className="w-full flex-auto bg-warm">
        <div className="container py-12 sm:py-16 lg:py-24">
          <div className="max-w-md mx-auto text-center">
            <LoadingSpinner size="large" />
            <h2 className="text-2xl font-semibold text-text-primary mt-6 mb-2">
              Verifying Payment
            </h2>
            <p className="text-text-secondary">
              Please wait while we confirm your payment...
              {retryCount > 0 && ` (Attempt ${retryCount + 1}/${maxRetries + 1})`}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Pending state (payment being processed)
  if (status === 'pending') {
    return (
      <main className="w-full flex-auto bg-warm">
        <div className="container py-12 sm:py-16 lg:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⏳</span>
            </div>
            <h1 className="text-3xl font-semibold text-text-primary mb-4">
              Payment Processing
            </h1>
            <p className="text-text-secondary mb-6">
              Your payment is being processed. This usually takes a few moments.
            </p>
            {order && (
              <div className="bg-white rounded-lg border border-border p-6 mb-6">
                <p className="text-sm text-text-secondary mb-2">Order Number</p>
                <p className="text-2xl font-semibold text-primary mb-4">
                  #{order.id}
                </p>
                <p className="text-text-secondary text-sm">
                  You'll receive an email confirmation once the payment is complete.
                </p>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => verifyPayment()}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Check Status Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white border border-border text-text-primary rounded-lg hover:bg-warm-ivory transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <main className="w-full flex-auto bg-warm">
        <div className="container py-12 sm:py-16 lg:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-3xl font-semibold text-text-primary mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-red-600 mb-6">
              {error}
            </p>
            <div className="bg-white rounded-lg border border-border p-6 mb-6 text-left">
              <h3 className="font-medium text-text-primary mb-2">What to do next:</h3>
              <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
                <li>Check your email for payment confirmation from Stripe</li>
                <li>Check your bank statement for any charges</li>
                <li>Contact our support team with session ID: <code className="bg-warm-ivory px-2 py-1 rounded text-xs">{sessionId}</code></li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/orders')}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white border border-border text-text-primary rounded-lg hover:bg-warm-ivory transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Success state
  return (
    <main className="w-full flex-auto bg-warm">
      <div className="container py-12 sm:py-16 lg:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary mb-2">
              Order Confirmed!
            </h1>
            <p className="text-text-secondary">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Order Number</p>
                  <p className="text-2xl font-semibold text-primary">
                    #{order.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary mb-1">Order Date</p>
                  <p className="text-sm font-medium text-text-primary">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Order Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Payment Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-lg font-medium text-text-primary">Total Paid</span>
                  <span className="text-2xl font-semibold text-primary">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-blue-900 mb-3">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span>📧</span>
                <span>You'll receive an order confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📦</span>
                <span>We'll notify you when your order is ready for shipping</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🚚</span>
                <span>Track your order status in your order history</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(`/orders/${order?.id}`)}
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg transition-colors font-medium"
            >
              View Order Details
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-white hover:bg-warm-ivory border border-border text-text-primary py-3 px-6 rounded-lg transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CheckoutSuccess;
