const express = require('express');
const router = express.Router();
const cartController = require('../Controller/cart.controller');
const authenticateUser = require('../Middleware/auth.middleware');

router.post('/add', authenticateUser, cartController.addToCart);
router.get('/', authenticateUser, cartController.getCart);
router.delete('/remove', authenticateUser, cartController.removeFromCart);
router.put('/update', authenticateUser, cartController.updateCartItem);

module.exports = router;
