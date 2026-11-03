import cartModel from '../models/cartModel.js';
import productModel from '../models/productModel.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.session.userId;

  const cartItems = await cartModel.getByUserId(userId);
  const total = await cartModel.getCartTotal(userId);

  res.json({
    success: true,
    cart: {
      items: cartItems,
      itemCount: cartItems.length,
      total: parseFloat(total)
    }
  });
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const { productId, quantity = 1 } = req.body;

  // Check if product exists
  const product = await productModel.getById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Get current quantity in cart if item already exists
  const existingItem = await cartModel.getCartItem(userId, productId);
  const currentQuantity = existingItem ? existingItem.quantity : 0;
  const newTotalQuantity = currentQuantity + quantity;

  // Check stock availability for cumulative quantity
  if (product.stock_quantity < newTotalQuantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock_quantity} items available in stock`
    });
  }

  // Add to cart
  await cartModel.addItem(userId, productId, quantity);

  // Get updated cart
  const cartItems = await cartModel.getByUserId(userId);
  const total = await cartModel.getCartTotal(userId);

  res.status(201).json({
    success: true,
    message: 'Item added to cart',
    cart: {
      items: cartItems,
      itemCount: cartItems.length,
      total: parseFloat(total)
    }
  });
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1'
    });
  }

  // Check if item exists in cart first
  const existingItem = await cartModel.getCartItem(userId, productId);
  if (!existingItem) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  // Check if product exists
  const product = await productModel.getById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check stock availability
  if (product.stock_quantity < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock_quantity} items available in stock`
    });
  }

  // Update quantity
  const updated = await cartModel.updateQuantity(userId, productId, quantity);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  // Get updated cart
  const cartItems = await cartModel.getByUserId(userId);
  const total = await cartModel.getCartTotal(userId);

  res.json({
    success: true,
    message: 'Cart updated',
    cart: {
      items: cartItems,
      itemCount: cartItems.length,
      total: parseFloat(total)
    }
  });
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const { productId } = req.params;

  const removed = await cartModel.removeItem(userId, productId);

  if (!removed) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  // Get updated cart
  const cartItems = await cartModel.getByUserId(userId);
  const total = await cartModel.getCartTotal(userId);

  res.json({
    success: true,
    message: 'Item removed from cart',
    cart: {
      items: cartItems,
      itemCount: cartItems.length,
      total: parseFloat(total)
    }
  });
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.session.userId;

  await cartModel.clearCart(userId);

  res.json({
    success: true,
    message: 'Cart cleared',
    cart: {
      items: [],
      itemCount: 0,
      total: 0
    }
  });
});
