const Admin = require('../Model/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerAdmin(req, res) {
  try {
    const { Fullname, Email, Password } = req.body;

    // Basic validation
    if (!Fullname || !Email || !Password) {
      return res.status(400).json({ message: 'Fullname, Email and Password are required' });
    }

    // Check if any admin already exists (only one admin allowed)
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        message: "Admin already exists. Only one admin is allowed. Please login with existing credentials."
      });
    }

    // Check if email is already used
    const isAdminExist = await Admin.findOne({ Email });
    if (isAdminExist) {
      return res.status(400).json({
        message: "Admin already exists, Please login"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create admin
    const newAdmin = await Admin.create({
      Fullname,
      Email,
      Password: hashedPassword
    });

    // Ensure JWT secret is present
    if (!process.env.JWT_SECRET) {
      console.error('registerAdmin error: JWT_SECRET is not set in environment');
      return res.status(500).json({ message: 'Server misconfiguration (missing JWT_SECRET)' });
    }

    // Generate token
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.cookie('adminToken', token);

    return res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: newAdmin._id,
        Email,
        Fullname
      }
    });
  } catch (err) {
    console.error('registerAdmin error:', err);
    return res.status(500).json({ message: "Server error while registering admin" });
  }
}

async function loginAdmin(req, res) {
  try {
    // Accept either `password` (frontend) or `Password` (some clients)
    const { Email, password, Password } = req.body || {};
    const inputPassword = password || Password;

    if (!Email || !inputPassword) {
      return res.status(400).json({ message: 'Please provide both Email and Password' });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ Email });
    if (!admin) {
      return res.status(400).json({
        message: "Invalid Email or Password"
      });
    }

    // Verify password - use the resolved inputPassword (handles both `password` and `Password` keys)
    if (typeof inputPassword !== 'string' || inputPassword.trim().length === 0) {
      console.warn(`loginAdmin warning: invalid password input for Email=${Email}`);
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    const isPasswordValid = await bcrypt.compare(inputPassword, admin.Password);
    if (!isPasswordValid) {
      console.warn(`loginAdmin warning: authentication failed for Email=${Email}`);
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    // Ensure JWT secret is present
    if (!process.env.JWT_SECRET) {
      console.error('loginAdmin error: JWT_SECRET is not set in environment');
      return res.status(500).json({ message: 'Server misconfiguration (missing JWT_SECRET)' });
    }

    // Generate token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.cookie('adminToken', token);

    return res.status(200).json({
      message: "Admin logged in successfully",
      token,
      admin: {
        id: admin._id,
        Email,
        Fullname: admin.Fullname
      }
    });
  } catch (err) {
    console.error('loginAdmin error:', err);
    return res.status(500).json({ message: "Server error while logging in admin" });
  }
}

async function checkAdminExists(req, res) {
  try {
    const adminCount = await Admin.countDocuments();
    return res.status(200).json({
      exists: adminCount > 0,
      message: adminCount > 0 ? "Admin already exists" : "No admin found"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
  checkAdminExists
};
