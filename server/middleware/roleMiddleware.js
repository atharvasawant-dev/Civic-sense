// server/middleware/roleMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
    if (err) {
      console.error('JWT verify error:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
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
    if (req.user && req.user.role === 'user') {
      next();
    } else {
      res.status(403).json({ message: 'User access required' });
    }
  });
};

module.exports = { verifyToken, verifyAdmin, verifyUser };
