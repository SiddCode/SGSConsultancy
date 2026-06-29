const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { uploadResume } = require('../middleware/upload');
const dbGuard = require('../middleware/dbGuard');

// Ensure DB is connected before any route handler runs
router.use(dbGuard);

// Models
const Setting = require('../models/Setting');
const Job = require('../models/Job');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Candidate = require('../models/Candidate');

// @route   GET /api/settings
// @desc    Get website contact settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // Fallback configuration if DB not seeded
      settings = {
        email: 'info@sgshrworkforce.com',
        linkedinUrl: 'https://linkedin.com',
        phone: '99405 43980'
      };
    }
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/jobs
// @desc    Get list of open jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job details
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/blogs
// @desc    Get all blog posts
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/blogs/:id
// @desc    Get single blog post
router.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/contact
// @desc    Submit a contact form query
router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    await newContact.save();
    res.json({ msg: 'Thank you! Your message has been received successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/candidates/register
// @desc    Candidate registration / application with resume file upload
router.post('/candidates/register', (req, res) => {
  uploadResume.single('resume')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ msg: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ msg: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a resume file (.pdf, .doc, or .docx)' });
    }

    const { name, email, phone, experience, appliedFor, coverLetter } = req.body;

    if (!name || !email || !phone || !experience) {
      return res.status(400).json({ msg: 'Please provide name, email, phone and experience level' });
    }

    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = 'resume-' + uniqueSuffix + path.extname(req.file.originalname);

      const newCandidate = new Candidate({
        name,
        email,
        phone,
        experience,
        appliedFor: appliedFor || 'General Registration',
        resumePath: `/uploads/resumes/${filename}`,
        resumeData: req.file.buffer.toString('base64'),
        resumeContentType: req.file.mimetype,
        coverLetter: coverLetter || ''
      });

      await newCandidate.save();
      res.json({ msg: 'Application submitted successfully! Our team will contact you shortly.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
});

module.exports = router;
