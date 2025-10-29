const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// ====== DATABASE CONNECTION ======
mongoose
  .connect('mongodb://localhost:27017/civic_sense')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ====== MIDDLEWARES ======
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ====== ROUTES ======
app.get('/', (req, res) => {
  res.send('Civic Sense backend is running!');
});

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Issue Routes
app.use('/api/issues', require('./routes/issueRoutes'));

// Admin Routes
app.use('/api/admin', require('./routes/adminRoutes'));

// ✅ Stats Route (NEW)
app.use('/api/stats', require('./routes/statsRoutes'));

// ====== SERVER START ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
