// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Issue = require('../models/Issue');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const { verifyUser } = require('../middleware/roleMiddleware');
const { buildImageUrl } = require('../services/uploadService');

// Get current user profile and civic karma stats
router.get('/profile', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalReports = await Issue.countDocuments({ user: req.user.id });
    const resolvedReports = await Issue.countDocuments({ user: req.user.id, status: 'Resolved' });

    // Calculate total upvotes received across user's reports (Civic Karma)
    const userIssues = await Issue.find({ user: req.user.id }).select('score');
    const totalKarma = userIssues.reduce((acc, curr) => acc + (curr.score || 0), 0);

    const totalVotesCast = await Vote.countDocuments({ user: req.user.id });
    const totalCommentsWritten = await Comment.countDocuments({ user: req.user.id });

    res.json({
      user,
      stats: {
        totalReports,
        resolvedReports,
        totalKarma,
        totalVotesCast,
        totalCommentsWritten,
      },
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Update profile
router.put('/profile', verifyUser, async (req, res) => {
  try {
    const { name, bio, pincode } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (typeof bio === 'string') updates.bio = bio.trim();
    if (typeof pincode === 'string') updates.pincode = pincode.trim();

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      select: '-password',
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Get user activity (upvoted issues, commented issues)
router.get('/activity', verifyUser, async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.user.id, value: 1 })
      .populate({
        path: 'issue',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();

    const userComments = await Comment.find({ user: req.user.id })
      .populate({
        path: 'issue',
        select: 'title category status date score',
      })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const host = `${req.protocol}://${req.get('host')}`;
    const upvotedIssues = votes
      .filter((v) => v.issue)
      .map((v) => ({
        ...v.issue,
        imageUrl: buildImageUrl(v.issue.image, host),
        votedAt: v.updatedAt,
      }));

    res.json({
      upvotedIssues,
      comments: userComments,
    });
  } catch (err) {
    console.error('Activity fetch error:', err);
    res.status(500).json({ error: 'Server error fetching activity' });
  }
});

module.exports = router;
