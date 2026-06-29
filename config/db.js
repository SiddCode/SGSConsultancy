const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // Already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // Use MONGODB_URI env var, fall back to local for dev only
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sgs_hr';

  if (!process.env.MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI not set. Using localhost (dev only). Set it in Render env vars for production.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
