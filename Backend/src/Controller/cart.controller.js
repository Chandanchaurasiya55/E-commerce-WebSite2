const User = require('../Model/user.model');
const Product = require('../Model/product.model');

// Add product to user's cart
async function addToCart(req, res) {
  try {
    const user = await User.findById(req.user._id);
    const { productId, quantity = 1 } = req.body;

    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existing = user.cart.find((c) => String(c.product) === String(productId));
    if (existing) {
      existing.quantity = existing.quantity + quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    return res.status(200).json({ message: 'Added to cart', cart: user.cart });
  } catch (err) {
    console.error('addToCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get current user's cart
async function getCart(req, res) {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    return res.status(200).json({ cart: user.cart });
  } catch (err) {
    console.error('getCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Remove an item from cart
async function removeFromCart(req, res) {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    user.cart = user.cart.filter((c) => String(c.product) !== String(productId));
    await user.save();
    return res.status(200).json({ message: 'Removed from cart', cart: user.cart });
  } catch (err) {
    console.error('removeFromCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Update quantity for an item
async function updateCartItem(req, res) {
  try {
    const user = await User.findById(req.user._id);
    const { productId, quantity } = req.body;
    if (!productId || typeof quantity === 'undefined') return res.status(400).json({ message: 'productId and quantity are required' });

    const item = user.cart.find((c) => String(c.product) === String(productId));
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity <= 0) {
      user.cart = user.cart.filter((c) => String(c.product) !== String(productId));
    } else {
      item.quantity = quantity;
    }

    await user.save();
    return res.status(200).json({ message: 'Cart updated', cart: user.cart });
  } catch (err) {
    console.error('updateCartItem error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { addToCart, getCart, removeFromCart, updateCartItem };
