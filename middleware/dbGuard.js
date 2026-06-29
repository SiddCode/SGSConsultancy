const mongoose = require('mongoose');
const connectDB = require('../config/db');

/**
 * Middleware that ensures a MongoDB connection is active before DB operations.
 * - For GET requests: tries to connect, but allows the route to handle its own fallback on failure.
 * - For write operations (POST/PUT/DELETE): returns 503 if DB is unavailable.
 */
const dbGuard = async (req, res, next) => {
  // Already connected — pass through immediately
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB guard: connection failed:', err.message);

    // For write operations, block and return error
    if (req.method !== 'GET') {
      return res.status(503).json({
        msg: 'Database is currently unavailable. Please try again shortly. If this persists, ensure MONGODB_URI is set correctly in your Render environment variables.'
      });
    }

    // For GET requests, let the route handler deal with it (it may have fallback data)
    next();
  }
};

module.exports = dbGuard;
