const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  Fullname: {
    type: String,
    required: true,
    trim: true
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  Password: {
    type: String,
    minlength: 8,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
