require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Models (for seeding)
const Setting = require('./models/Setting');
const Job = require('./models/Job');
const Blog = require('./models/Blog');

const app = express();

// CORS — allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint (Render pings this to keep service alive)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback: serve index.html for unknown paths (multi-page site)
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database Seeding Logic
const seedDatabase = async () => {
  try {
    const dbJsonPath = path.join(__dirname, 'db.json');
    if (!fs.existsSync(dbJsonPath)) {
      console.log('db.json not found, skipping seeding.');
      return;
    }

    const data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

    // 1. Seed Settings if empty
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0 && data.settings) {
      console.log('Seeding settings...');
      await Setting.create(data.settings);
      console.log('Settings seeded.');
    }

    // 2. Seed Jobs if empty
    const jobsCount = await Job.countDocuments();
    if (jobsCount === 0 && data.jobs && data.jobs.length > 0) {
      console.log('Seeding jobs...');
      await Job.create(data.jobs);
      console.log('Jobs seeded.');
    }

    // 3. Seed Blogs if empty
    const blogsCount = await Blog.countDocuments();
    if (blogsCount === 0 && data.blogs && data.blogs.length > 0) {
      console.log('Seeding blogs...');
      await Blog.create(data.blogs);
      console.log('Blogs seeded.');
    }

  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Start server — works on Render, local dev, and any traditional host
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`MONGODB_URI set: ${!!process.env.MONGODB_URI}`);
  try {
    await connectDB();
    await seedDatabase();
    console.log('Database ready.');
  } catch (err) {
    console.error('FATAL: Could not connect to MongoDB:', err.message);
    console.error('Ensure MONGODB_URI environment variable is set to a valid MongoDB Atlas URI.');
  }
});

// Export app (for any serverless adapter if needed)
module.exports = app;
