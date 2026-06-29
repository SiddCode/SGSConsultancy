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

// CORS — allow all origins (works for both local dev and Vercel)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect DB on each cold-start (cached after first connection)
connectDB().catch((err) => {
  console.error('Database connection failed on startup:', err.message);
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Fallback: serve index.html for unknown paths (multi-page site)
app.get('*', (req, res, next) => {
  // If request is for an API, pass to next handler (404)
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
      console.log('Seeding settings database from db.json...');
      await Setting.create(data.settings);
      console.log('Settings database seeded successfully!');
    }

    // 2. Seed Jobs if empty
    const jobsCount = await Job.countDocuments();
    if (jobsCount === 0 && data.jobs && data.jobs.length > 0) {
      console.log('Seeding jobs database from db.json...');
      await Job.create(data.jobs);
      console.log('Jobs database seeded successfully!');
    }

    // 3. Seed Blogs if empty
    const blogsCount = await Blog.countDocuments();
    if (blogsCount === 0 && data.blogs && data.blogs.length > 0) {
      console.log('Seeding blogs database from db.json...');
      await Blog.create(data.blogs);
      console.log('Blogs database seeded successfully!');
    }

  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Only start HTTP server in local development (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    console.log(`Server started on port ${PORT}`);
    await seedDatabase();
  });
}

// Export app for Vercel serverless handler
module.exports = app;
