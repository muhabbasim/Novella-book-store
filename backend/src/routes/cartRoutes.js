import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateCartItem, validateCartUpdate } from '../middleware/validation.js';

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

router.get('/', getCart);
router.post('/', validateCartItem, addToCart);
router.put('/:productId', validateCartUpdate, updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
