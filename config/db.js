const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Please add it to your Render environment variables. ' +
      'Get a free Atlas URI at https://cloud.mongodb.com'
    );
  }

  if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
    throw new Error(
      'MONGODB_URI is set to localhost which does not work on Render. ' +
      'Use a MongoDB Atlas connection string instead.'
    );
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,  // 10s timeout for Atlas
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
