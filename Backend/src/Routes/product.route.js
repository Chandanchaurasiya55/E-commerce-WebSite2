const express = require('express');
const router = express.Router();
const productController = require('../Controller/product.controller');
const authenticateAdmin = require('../Middleware/admin.middleware');

// Public: get list of products
router.get('/products', productController.getProducts);

// Public: get single product by id
router.get('/products/:id', productController.getProductById);

// Create a product (previously required a seller key header; now public)
router.post('/admin/product', productController.createProduct);

// Admin delete - remove a product by id
router.delete('/admin/product/:id', authenticateAdmin, productController.deleteProduct);

module.exports = router;
