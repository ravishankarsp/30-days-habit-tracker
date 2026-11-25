const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, getConnectionStatus } = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/daybyday';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
    credentials: true
  })
);
app.use(express.json());

// Initialize Database Connection
connectDB(MONGO_URI);

/* ==================== API ROUTES ==================== */

// Health & DB Status Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    database: getConnectionStatus() ? 'MongoDB (Connected)' : 'In-Memory Resilient Store',
    mongoUri: MONGO_URI,
    timestamp: new Date()
  });
});

// Modular Feature Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/notifications', notificationRoutes);

// Global 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 DayByDay API Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'production'} mode`);
});
