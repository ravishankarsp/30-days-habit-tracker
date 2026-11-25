const Notification = require('../models/Notification');
const { getConnectionStatus } = require('../config/db');
const memoryStore = require('../config/memoryStore');

// GET user notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (getConnectionStatus()) {
      const notifs = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(30);
      return res.json(notifs);
    }

    const notifs = memoryStore.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);
    return res.json(notifs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST create notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    const uid = userId || req.headers['x-user-id'];
    if (!uid || !title || !message) {
      return res.status(400).json({ error: 'userId, title, and message are required' });
    }

    if (getConnectionStatus()) {
      const created = await Notification.create({
        userId: uid,
        title,
        message,
        type: type || 'system',
        read: false,
        time: 'Just now'
      });
      return res.status(201).json(created);
    }

    const created = {
      _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: uid,
      title,
      message,
      type: type || 'system',
      read: false,
      time: 'Just now',
      createdAt: new Date()
    };
    memoryStore.notifications.unshift(created);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (getConnectionStatus()) {
      const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
      return res.json(updated || { success: true });
    }

    const target = memoryStore.notifications.find((n) => n._id === id);
    if (target) target.read = true;
    return res.json(target || { success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT mark all user notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.body;
    const uid = userId || req.headers['x-user-id'];
    if (!uid) return res.status(400).json({ error: 'userId is required' });

    if (getConnectionStatus()) {
      await Notification.updateMany({ userId: uid, read: false }, { read: true });
      return res.json({ success: true });
    }

    memoryStore.notifications.forEach((n) => {
      if (n.userId === uid) n.read = true;
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE single notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (getConnectionStatus()) {
      await Notification.findByIdAndDelete(id);
      return res.json({ success: true });
    }
    memoryStore.notifications = memoryStore.notifications.filter((n) => n._id !== id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
