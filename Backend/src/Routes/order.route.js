const express = require('express');
const router = express.Router();
const orderController = require('../Controller/order.controller');
const authenticateUser = require('../Middleware/auth.middleware');
const authenticateAdmin = require('../Middleware/admin.middleware');

// User checkout
router.post('/checkout', authenticateUser, orderController.checkout);

// User: fetch own orders
router.get('/my', authenticateUser, orderController.getUserOrders);

// Admin-only endpoints
router.get('/admin/recent-orders', authenticateAdmin, orderController.getRecentOrders);
router.get('/admin/orders', authenticateAdmin, orderController.getAllOrders);

// Admin: delete an order
router.delete('/admin/order/:id', authenticateAdmin, orderController.deleteOrder);

// Admin: update order status
router.patch('/admin/order/:id', authenticateAdmin, orderController.updateOrderStatus);

module.exports = router;
