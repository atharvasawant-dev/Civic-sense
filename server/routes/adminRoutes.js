// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { verifyAdmin } = require('../middleware/roleMiddleware');

// ✅ Get all issues
router.get('/issues', verifyAdmin, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('user', 'name email')
      .sort({ date: -1 });
    res.json(issues);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Server error fetching issues' });
  }
});

// ✅ Update issue status
router.put('/issues/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ message: 'Status updated successfully', issue });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Server error updating status' });
  }
});

// ✅ Delete issue
router.delete('/issues/:id', verifyAdmin, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ error: 'Server error deleting issue' });
  }
});

module.exports = router;
