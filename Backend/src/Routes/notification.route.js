const express = require('express');
const router = express.Router();
const notifyCtrl = require('../Controller/notification.controller');
const authenticateAdmin = require('../Middleware/admin.middleware');

// Public/admin listing (GET /api/notifications)
router.get('/', authenticateAdmin, notifyCtrl.getNotifications);

// Admin specific listing (GET /api/notifications/admin)
router.get('/admin', authenticateAdmin, notifyCtrl.getAdminNotifications);

// Admin mark notification as read
router.put('/:id/read', authenticateAdmin, notifyCtrl.markRead);

module.exports = router;
