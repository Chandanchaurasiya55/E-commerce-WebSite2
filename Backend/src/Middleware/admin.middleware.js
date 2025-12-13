const jwt = require('jsonwebtoken');
const Admin = require('../Model/admin.model');

// Middleware to authenticate admin using JWT token
async function authenticateAdmin(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];

    if (!token && req.cookies && req.cookies.adminToken) token = req.cookies.adminToken;

    if (!token) return res.status(401).json({ message: 'Admin auth required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-Password');
    if (!admin) return res.status(401).json({ message: 'Admin not found' });

    req.admin = admin;
    next();
  } catch (err) {
    console.error('authenticateAdmin error:', err.message || err);
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }
}

module.exports = authenticateAdmin;
