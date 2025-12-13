const jwt = require('jsonwebtoken');
const userModel = require('../Model/user.model');

// Middleware to authenticate a user using JWT token
async function authenticateUser(req, res, next) {
    try {
        // Try to read token from Authorization header (Bearer) first
        let token = null;
        const authHeader = req.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        // Fallback: cookies (if cookie-parser is used)
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-Password');
        if (!user) return res.status(401).json({ message: 'User not found' });

        req.user = user; // attach user to request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = authenticateUser;



