const Order = require('../Model/order.model');
const User = require('../Model/user.model');
const Product = require('../Model/product.model');
const { createNotification } = require('./notification.controller');

// Checkout — create an order from user's cart
async function checkout(req, res) {
  try {
      const userId = req.user._id;
      const user = await User.findById(userId).populate('cart.product');

      if (!user) return res.status(404).json({ message: 'User not found' });

      // Support buy-now: client may pass an `items` array in the request to place an immediate order
      let items = [];
      let usedCart = false;
      if (Array.isArray(req.body.items) && req.body.items.length > 0) {
        items = req.body.items.map(it => ({
          product: it.product || null,
          title: it.title || '',
          price: it.price || '0',
          img: (it.images && it.images.length) ? it.images[0] : (it.img || ''),
          images: it.images || (it.img ? [it.img] : []),
          quantity: it.quantity || 1
        }));
      } else {
        if (!user.cart || user.cart.length === 0) return res.status(400).json({ message: 'Cart is empty' });
        usedCart = true;
        // Build order items from cart
        items = user.cart.map(c => {
          const p = c.product || {};
          const images = (p.images && p.images.length) ? p.images : (p.img ? [p.img] : []);
          return {
            product: p._id || p,
            title: p.title || '',
            price: p.price || '0',
            img: images[0] || '',
            images,
            quantity: c.quantity || 1
          };
        });
      }

    // Calculate total amount
    const totalAmount = items.reduce((sum, it) => {
      const numeric = parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0;
      return sum + numeric * (it.quantity || 1);
    }, 0);

    // Accept address and payment method from request body
    const address = req.body?.address || {};
    const paymentMethod = req.body?.paymentMethod || 'unknown';

    // Minimal validation: require street and city or postalCode/country
    if (!address || (!address.street && !address.postalCode)) {
      // allow checkout, but warn — ideally require full address
      console.warn('checkout warning: address missing or incomplete for user', userId);
    }

    const saved = await Order.create({ user: userId, items, totalAmount, shippingAddress: address, paymentMethod });

    // Clear cart only when the order was built from the user's cart
    if (usedCart) {
      user.cart = [];
      await user.save();
    }

    // create admin notification about new order: include the order details in notification.meta
    try {
      const userName = user.Fullname || user.Email || String(userId);
      const meta = {
        orderId: saved._id,
        user: { id: user._id, name: user.Fullname || null, email: user.Email || null, phone: user.phone || null },
        items: items.map(it => ({ title: it.title, product: it.product, price: it.price, quantity: it.quantity })),
        totalAmount,
        shippingAddress: address || null,
        paymentMethod
      };

      const methodNote = paymentMethod === 'cod' ? ' (COD)' : '';
      await createNotification({
        type: 'order',
        message: `${userName} placed a new order${methodNote} (${saved._id})`,
        user: userId,
        meta // attach full order data to notification meta so admins can preview details
      });
    } catch (err) {
      console.error('failed to create notification for order', err);
    }

    return res.status(201).json({ message: 'Order placed', order: saved });
  } catch (err) {
    console.error('checkout error', err);
    return res.status(500).json({ message: 'Server error while placing order' });
  }
}

// Admin: recent orders (latest N)
async function getRecentOrders(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const orders = await Order.find().sort({ createdAt: -1 }).limit(limit).populate('user', 'Fullname Email');

    // Flatten items from the latest orders into a list of ordered products (most recent first)
    const recentItems = [];
    for (const o of orders) {
      for (const it of o.items) {
        recentItems.push({
          orderId: o._id,
          productId: it.product,
          title: it.title || '',
          price: it.price || '',
          img: (it.images && it.images.length) ? it.images[0] : (it.img || ''),
          images: it.images || (it.img ? [it.img] : []),
          quantity: it.quantity || 1,
          orderedAt: o.createdAt,
          orderedBy: o.user ? { id: o.user._id, name: o.user.Fullname, email: o.user.Email } : null,
          shippingAddress: o.shippingAddress || null
        });
      }
    }

    return res.status(200).json({ items: recentItems });
  } catch (err) {
    console.error('getRecentOrders error', err);
    return res.status(500).json({ message: 'Server error while fetching recent orders' });
  }
}

// Admin: all orders
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'Fullname Email');
    return res.status(200).json({ orders });
  } catch (err) {
    console.error('getAllOrders error', err);
    return res.status(500).json({ message: 'Server error while fetching orders' });
  }
}

// User: get own orders
async function getUserOrders(req, res) {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error('getUserOrders error', err);
    return res.status(500).json({ message: 'Server error while fetching user orders' });
  }
}

module.exports = { checkout, getRecentOrders, getAllOrders, getUserOrders };

// Admin: delete an order by id
async function deleteOrder(req, res) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Order id required' });

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });

    return res.status(200).json({ message: 'Order deleted', order: deleted });
  } catch (err) {
    console.error('deleteOrder error', err);
    return res.status(500).json({ message: 'Server error while deleting order' });
  }
}

// Admin: update order status (e.g. placed -> shipped -> delivered)
async function updateOrderStatus(req, res) {
  try {
    const id = req.params.id;
    const newStatus = req.body?.status;
    if (!id) return res.status(400).json({ message: 'Order id required' });
    if (!newStatus) return res.status(400).json({ message: 'New status required' });

    const updated = await Order.findByIdAndUpdate(id, { status: newStatus }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Order not found' });

    return res.status(200).json({ message: 'Order updated', order: updated });
  } catch (err) {
    console.error('updateOrderStatus error', err);
    return res.status(500).json({ message: 'Server error while updating order' });
  }
}

// export deletion
module.exports = { checkout, getRecentOrders, getAllOrders, getUserOrders, deleteOrder, updateOrderStatus };
