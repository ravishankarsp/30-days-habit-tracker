const User = require('../models/User');
const { getConnectionStatus } = require('../config/db');
const memoryStore = require('../config/memoryStore');

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    if (getConnectionStatus()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        error: 'Account not found! Please create an account first by clicking "Sign up for free".'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        error: 'Incorrect password. Please enter the correct password.'
      });
    }

    return res.json({
      message: 'Login successful!',
      token: 'jwt_mock_token_30day_tracker',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak || 0,
        avatar: user.avatar || ''
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Register New User
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (getConnectionStatus()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({
          error: 'An account with this email already exists. Please sign in.'
        });
      }
      const newUser = new User({
        name,
        email: cleanEmail,
        password,
        streak: 0
      });
      await newUser.save();

      return res.status(201).json({
        message: 'Account created successfully!',
        token: 'jwt_mock_token_30day_tracker',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          streak: newUser.streak,
          avatar: newUser.avatar
        }
      });
    }

    // In-Memory Fallback
    const existing = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({
        error: 'An account with this email already exists. Please sign in.'
      });
    }

    const newUser = {
      _id: `mem_user_${Date.now()}`,
      name,
      email: cleanEmail,
      password,
      streak: 0,
      avatar: ''
    };
    memoryStore.users.push(newUser);

    return res.status(201).json({
      message: 'Account created successfully!',
      token: 'jwt_mock_token_30day_tracker',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        streak: newUser.streak,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const uid = userId || req.headers['x-user-id'];

    if (!uid || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    if (getConnectionStatus()) {
      const user = await User.findById(uid);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      if (user.password !== currentPassword) {
        return res.status(401).json({ error: 'Current password does not match.' });
      }

      user.password = newPassword;
      await user.save();
      return res.json({
        success: true,
        message: 'Password updated successfully!'
      });
    }

    // In-memory fallback
    const user = memoryStore.users.find((u) => u._id === uid);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password does not match.' });
    }

    user.password = newPassword;
    return res.json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
