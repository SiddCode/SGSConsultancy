const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Models
const Setting = require('../models/Setting');
const Job = require('../models/Job');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Candidate = require('../models/Candidate');

// Apply auth middleware to all admin routes
router.use(auth);

// ==========================================
// Settings Management
// ==========================================

// @route   POST /api/admin/settings
// @desc    Update website configuration (Email, LinkedIn, Phone, Logo, Founder Photo)
router.post('/settings', (req, res) => {
  uploadImage.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'founderPhoto', maxCount: 1 }
  ])(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ msg: err.message });
    }

    const { email, linkedinUrl, phone, location, founderName, founderBio } = req.body;

    if (!email || !linkedinUrl || !phone) {
      return res.status(400).json({ msg: 'Please provide email, linkedinUrl and phone' });
    }

    try {
      let settings = await Setting.findOne();

      const updateData = { email, linkedinUrl, phone, location, founderName, founderBio };

      // Handle logo upload
      if (req.files && req.files['logo'] && req.files['logo'][0]) {
        updateData.logoPath = `/uploads/images/${req.files['logo'][0].filename}`;
      }

      // Handle founder photo upload
      if (req.files && req.files['founderPhoto'] && req.files['founderPhoto'][0]) {
        updateData.founderPhotoPath = `/uploads/images/${req.files['founderPhoto'][0].filename}`;
      }

      if (settings) {
        settings.email = email;
        settings.linkedinUrl = linkedinUrl;
        settings.phone = phone;
        settings.location = location || settings.location;
        settings.founderName = founderName || settings.founderName;
        settings.founderBio = founderBio || settings.founderBio;
        if (updateData.logoPath) settings.logoPath = updateData.logoPath;
        if (updateData.founderPhotoPath) settings.founderPhotoPath = updateData.founderPhotoPath;
        await settings.save();
      } else {
        settings = new Setting(updateData);
        await settings.save();
      }

      res.json({ msg: 'Settings updated successfully', settings });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
});

// ==========================================
// Jobs Management (CRUD)
// ==========================================

// @route   POST /api/admin/jobs
// @desc    Create a job opening
router.post('/jobs', async (req, res) => {
  const { title, department, location, type, experience, description, requirements, salary } = req.body;

  if (!title || !department || !location || !type || !experience || !description || !requirements || !requirements.length) {
    return res.status(400).json({ msg: 'Please enter all required fields' });
  }

  try {
    const newJob = new Job({
      title,
      department,
      location,
      type,
      experience,
      description,
      requirements,
      salary
    });

    const job = await newJob.save();
    res.json({ msg: 'Job created successfully', job });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/jobs/:id
// @desc    Update a job opening
router.put('/jobs/:id', async (req, res) => {
  const { title, department, location, type, experience, description, requirements, salary, status } = req.body;

  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    job.title = title || job.title;
    job.department = department || job.department;
    job.location = location || job.location;
    job.type = type || job.type;
    job.experience = experience || job.experience;
    job.description = description || job.description;
    job.requirements = requirements || job.requirements;
    job.salary = salary !== undefined ? salary : job.salary;
    job.status = status || job.status;

    await job.save();
    res.json({ msg: 'Job updated successfully', job });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete a job opening
router.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    await Job.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Job deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// Blogs Management (CRUD)
// ==========================================

// @route   POST /api/admin/blogs
// @desc    Create a blog post
router.post('/blogs', (req, res) => {
  uploadImage.single('blogImage')(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ msg: err.message });
    }

    const { title, category, summary, content, author, readTime } = req.body;

    if (!title || !category || !summary || !content) {
      return res.status(400).json({ msg: 'Please enter title, category, summary and content' });
    }

    try {
      const blogData = {
        title,
        category,
        summary,
        content,
        author: author || 'SGS HR Team',
        readTime: readTime || '5 min read'
      };

      if (req.file) {
        blogData.image = `/uploads/images/${req.file.filename}`;
      } else {
        blogData.image = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop';
      }

      const newBlog = new Blog(blogData);
      const blog = await newBlog.save();
      res.json({ msg: 'Blog post created successfully', blog });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
});

// @route   PUT /api/admin/blogs/:id
// @desc    Update a blog post
router.put('/blogs/:id', (req, res) => {
  uploadImage.single('blogImage')(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ msg: err.message });
    }

    const { title, category, summary, content, author, readTime } = req.body;

    try {
      let blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ msg: 'Blog post not found' });
      }

      blog.title = title || blog.title;
      blog.category = category || blog.category;
      blog.summary = summary || blog.summary;
      blog.content = content || blog.content;
      blog.author = author || blog.author;
      blog.readTime = readTime || blog.readTime;
      
      if (req.file) {
        blog.image = `/uploads/images/${req.file.filename}`;
      }

      await blog.save();
      res.json({ msg: 'Blog post updated successfully', blog });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
});

// @route   DELETE /api/admin/blogs/:id
// @desc    Delete a blog post
router.delete('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    await Blog.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Blog post deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// Contacts Submissions Management
// ==========================================

// @route   GET /api/admin/contacts
// @desc    Retrieve list of contact inquiries
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/contacts/:id/status
// @desc    Update status of contact message (Unread/Read/Replied)
router.put('/contacts/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status || !['Unread', 'Read', 'Replied'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status value' });
  }

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact message not found' });
    }

    contact.status = status;
    await contact.save();
    res.json({ msg: 'Status updated successfully', contact });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// Candidate Applications Management
// ==========================================

// @route   GET /api/admin/candidates
// @desc    Get all candidate registrations
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/resumes/download/:filename
// @desc    Download candidate resume securely
router.get('/resumes/download/:filename', (req, res) => {
  const filename = req.params.filename;
  // Security check: prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ msg: 'Access denied: invalid file path' });
  }

  const filePath = path.join(__dirname, '../public/uploads/resumes', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error during file transfer:', err);
        res.status(500).send('Could not download the file.');
      }
    });
  } else {
    res.status(404).json({ msg: 'File not found on server' });
  }
});

// @route   DELETE /api/admin/contacts/:id
// @desc    Delete a contact message
router.delete('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact message not found' });
    }
    await Contact.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Contact message deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/candidates/:id
// @desc    Delete a candidate profile and resume
router.delete('/candidates/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found' });
    }
    
    if (candidate.resumePath) {
      const filename = candidate.resumePath.split('/').pop();
      const filePath = path.join(__dirname, '../public/uploads/resumes', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Candidate.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Candidate application deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
