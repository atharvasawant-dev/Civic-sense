const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const app = express();

// Trust reverse proxy (for correct protocol/IP on Render, Vercel, Heroku)
app.set('trust proxy', 1);

// ====== DATABASE CONNECTION ======
connectDB().catch(() => {
  // Connection error is thoroughly diagnosed and logged inside connectDB
});

// ====== CORS CONFIGURATION ======
const isProduction = process.env.NODE_ENV === 'production';
let corsOptions;

if (isProduction) {
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    console.error('⛔ [SECURITY CRITICAL] CLIENT_URL environment variable is not defined in production.');
  }

  const allowedOrigins = clientUrl
    ? clientUrl
        .split(',')
        .map((url) => url.trim().replace(/\/$/, ''))
        .filter(Boolean)
    : [];

  corsOptions = {
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. server-to-server, curl, Postman, health-check monitors)
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.length > 0 && allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin "${origin}" is not authorized by policy.`));
    },
    credentials: true,
  };
} else {
  // Local development: allow configured CLIENT_URL or reflect requesting origin
  corsOptions = {
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  };
}

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Serve uploaded images (local development fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ====== ROUTES ======
app.get('/', (req, res) => {
  res.send('Civic Sense backend is running!');
});

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

// User Profile & Activity Routes
app.use('/api/users', require('./routes/userRoutes'));

// Notification Routes
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Issue Routes
app.use('/api/issues', require('./routes/issueRoutes'));

// Admin Routes
app.use('/api/admin', require('./routes/adminRoutes'));

// ✅ Stats Route
app.use('/api/stats', require('./routes/statsRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ====== SERVER START ======
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
