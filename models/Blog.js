const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Hiring Trends', 'Career Tips', 'Recruitment Insights'],
    default: 'Recruitment Insights'
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    default: 'SGS HR Team'
  },
  readTime: {
    type: String,
    required: true,
    default: '5 min read'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop'
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);
