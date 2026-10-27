import { Routes, Route } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import ScrollToTop from '../components/ScrollToTop';
import Home from '../pages/Home';
import Product from '../pages/Product';
import CartPage from '../pages/CartPage';
import Checkout from '../pages/Checkout';
import CheckoutStripe from '../pages/CheckoutStripe';
import CheckoutSuccess from '../pages/CheckoutSuccess';
import CheckoutCancel from '../pages/CheckoutCancel';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Notfound from '../pages/Notfound';
import ProtectedRoute from '../components/ProtectedRoute';

/**
 * Main Layout Component
 * Handles the overall page structure with header, footer, and routing
 */
function MainLayout() {
  const { totalCartCount, toast, setToast } = useCartContext();

  return (
    <div className="min-h-screen flex flex-col bg-warm overflow-x-hidden">
      <ScrollToTop />
      <Header cartCount={totalCartCount} />
      <div className="flex-1 pt-16 sm:pt-18">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route 
            path="/cart" 
            element={
              // <ProtectedRoute>
                <CartPage />
              // </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutStripe />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout/success" 
            element={
              <ProtectedRoute>
                <CheckoutSuccess />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout/cancel" 
            element={
              <ProtectedRoute>
                <CheckoutCancel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders/:id" 
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </div>
      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default MainLayout;
