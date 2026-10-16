// server/middleware/roleMiddleware.js
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : parts[0];

  jwt.verify(token, getJwtSecret(), (err, decoded) => {
    if (err) {
      console.error('JWT verify error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Normalize req.user to always have id and role
    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role
    };
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  });
};

const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    // Both citizens and admins can access citizen endpoints
    if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
      next();
    } else {
      res.status(403).json({ message: 'User access required' });
    }
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : parts[0];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, getJwtSecret(), (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = {
        id: decoded.id || decoded._id,
        role: decoded.role,
      };
    }
    next();
  });
};

module.exports = { verifyToken, verifyAdmin, verifyUser, optionalAuth };
