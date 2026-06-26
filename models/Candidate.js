const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  appliedFor: {
    type: String, // Can be "General Registration" or a Job Title
    required: true,
    default: 'General Registration'
  },
  resumePath: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', CandidateSchema);
