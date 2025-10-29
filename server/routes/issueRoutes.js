const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { verifyUser } = require('../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(file.mimetype) && allowed.test(ext)) return cb(null, true);
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  },
});

// -------------------- ROUTES --------------------

// ✅ Get all issues (Admin)
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find().populate('user', 'email').sort({ date: -1 });
    const host = `${req.protocol}://${req.get('host')}`;
    const formatted = issues.map((i) => ({
      _id: i._id,
      title: i.title,
      description: i.description,
      category: i.category,
      landmark: i.landmark || "N/A",
      pincode: i.pincode || "N/A",
      status: i.status,
      date: i.date,
      user: i.user,
      imageUrl: i.image ? `${host}/uploads/${i.image}` : null,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get issues reported by logged-in user
router.get('/my', verifyUser, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const issues = await Issue.find({ user: userId }).sort({ date: -1 }).lean();
    const host = `${req.protocol}://${req.get('host')}`;
    const withUrls = issues.map((i) => ({
      ...i,
      imageUrl: i.image ? `${host}/uploads/${i.image}` : null,
    }));
    res.json(withUrls);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Add new issue
router.post('/', verifyUser, upload.single('image'), async (req, res) => {
  const { title, description, category, landmark, pincode, status, date } = req.body;

  if (!title || !description || !category || !landmark || !pincode) {
    return res.status(400).json({
      error: 'All fields (title, description, category, landmark, pincode) are required',
    });
  }

  try {
    const filename = req.file ? req.file.filename : null;
    const issueDate = date ? new Date(date) : new Date();

    const newIssue = new Issue({
      title,
      description,
      category,
      landmark,
      pincode,
      status: status || 'Pending',
      date: issueDate,
      user: req.user.id,
      image: filename,
    });

    await newIssue.save();

    const imageUrl = filename ? `${req.protocol}://${req.get('host')}/uploads/${filename}` : null;
    res.status(201).json({ message: 'Issue created', issue: newIssue, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update issue status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Issue.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Issue not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Delete issue
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Issue.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Issue not found' });
    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
