// Validation middleware functions

export const validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = [];

  // Email validation
  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // Name validation
  if (!name || !name.trim()) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateCartItem = (req, res, next) => {
  const { productId, quantity } = req.body;
  const errors = [];

  if (!productId) {
    errors.push('Product ID is required');
  } else if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) {
    errors.push('Invalid product ID');
  }

  if (quantity !== undefined) {
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      errors.push('Quantity must be a positive integer');
    } else if (Number(quantity) > 999) {
      errors.push('Quantity cannot exceed 999');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateCartUpdate = (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;
  const errors = [];

  if (!productId) {
    errors.push('Product ID is required');
  } else if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) {
    errors.push('Invalid product ID');
  }

  if (quantity === undefined) {
    errors.push('Quantity is required');
  } else if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1'
    });
  } else if (Number(quantity) > 999) {
    errors.push('Quantity cannot exceed 999');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateUpdateProfile = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (email !== undefined) {
    if (!email.trim()) {
      errors.push('Email cannot be empty');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }
  }

  if (name !== undefined) {
    if (!name.trim()) {
      errors.push('Name cannot be empty');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};
