const express = require('express');
const adminController = require('../Controller/admin.controller');
const router = express.Router();

// Admin auth APIs
router.post('/admin/register', adminController.registerAdmin);
router.post('/admin/login', adminController.loginAdmin);
router.get('/admin/check', adminController.checkAdminExists);

module.exports = router;
