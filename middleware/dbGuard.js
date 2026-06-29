const mongoose = require('mongoose');
const connectDB = require('../config/db');

/**
 * Middleware that ensures a MongoDB connection is active before handling any
 * database operation. This protects against race conditions on Render where
 * an HTTP request arrives before the initial connectDB() completes.
 */
const dbGuard = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    // Already connected
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB guard failed:', err.message);
    return res.status(503).json({
      msg: 'Database is unavailable. Please ensure MONGODB_URI is correctly set in Render environment variables.',
      error: err.message
    });
  }
};

module.exports = dbGuard;
