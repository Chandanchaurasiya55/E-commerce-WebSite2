const Notification = require('../Model/notification.model');

// Create a notification (internal use)
async function createNotification(payload) {
  try {
    const n = await Notification.create(payload);
    return n;
  } catch (err) {
    console.error('createNotification error', err);
    return null;
  }
}

// User/Admin: list notifications (query limited)
async function getNotifications(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(limit).populate('user', 'Fullname Email');
    return res.status(200).json({ notifications });
  } catch (err) {
    console.error('getNotifications error', err);
    return res.status(500).json({ message: 'Server error while fetching notifications' });
  }
}

// Admin: list notifications (explicit admin endpoint)
async function getAdminNotifications(req, res) {
  try {
    const items = await Notification.find().sort({ createdAt: -1 }).limit(50).populate('user', 'Fullname Email');
    return res.status(200).json({ notifications: items });
  } catch (err) {
    console.error('getAdminNotifications error', err);
    return res.status(500).json({ message: 'Server error while fetching notifications' });
  }
}

// Admin: mark a notification as read
async function markRead(req, res) {
  try {
    const id = req.params.id;
    const n = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    return res.status(200).json({ notification: n });
  } catch (err) {
    console.error('markRead error', err);
    return res.status(500).json({ message: 'Server error while updating notification' });
  }
}

module.exports = { createNotification, getNotifications, getAdminNotifications, markRead };
