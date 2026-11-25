const mongoose = require('mongoose');

const state = {
  isMongoConnected: false
};

const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    state.isMongoConnected = true;
    console.log('✅ Connected to MongoDB successfully at:', mongoUri);
  } catch (err) {
    state.isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection not reached (${err.message}).`);
    console.warn('🚀 Running with resilient In-Memory Store so the application works seamlessly!');
  }
};

module.exports = {
  connectDB,
  getConnectionStatus: () => state.isMongoConnected
};
