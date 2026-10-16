// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { verifyAdmin } = require('../middleware/roleMiddleware');
const { buildImageUrl } = require('../services/uploadService');

// ✅ Get all issues
router.get('/issues', verifyAdmin, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('user', 'name email')
      .sort({ date: -1 });
    const host = `${req.protocol}://${req.get('host')}`;
    const formatted = issues.map((i) => ({
      ...i.toObject(),
      imageUrl: buildImageUrl(i.image, host),
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Server error fetching issues' });
  }
});

// ✅ Update issue status
router.put('/issues/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed values: ${allowed.join(', ')}` });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Send notification to author
    await Notification.create({
      recipient: issue.user,
      issue: issue._id,
      type: 'status_change',
      message: `Your civic report "${issue.title}" status was updated to "${status}".`,
    }).catch((err) => console.error('Notification error:', err));

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
