const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['streak', 'sprint', 'task', 'system', 'focus'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  time: {
    type: String,
    default: 'Just now'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // auto-clean after 30 days
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
