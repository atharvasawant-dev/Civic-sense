const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
    const pendingIssues = await Issue.countDocuments({ status: 'Pending' });
    const activeUsers = await User.countDocuments();

    res.json({
      totalIssues,
      resolvedIssues,
      pendingIssues,
      activeUsers,
    });
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
