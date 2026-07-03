const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  linkedinUrl: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    default: '99405 43980'
  },
  logoPath: {
    type: String,
    trim: true,
    default: ''
  },
  founderPhotoPath: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: 'Chennai, Tamil Nadu, India'
  },
  founderName: {
    type: String,
    trim: true,
    default: 'Founder & Managing Partner'
  },
  founderBio: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
