// server/routes/issueRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Issue = require('../models/Issue');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { upload, uploadImage, buildImageUrl } = require('../services/uploadService');
const { verifyUser, verifyAdmin, optionalAuth } = require('../middleware/roleMiddleware');

// Helper to format issue with computed properties
const formatIssue = (issue, host, userVoteMap = {}) => {
  const i = issue.toObject ? issue.toObject() : issue;
  return {
    ...i,
    score: typeof i.score === 'number' ? i.score : 0,
    upvotesCount: typeof i.upvotesCount === 'number' ? i.upvotesCount : 0,
    downvotesCount: typeof i.downvotesCount === 'number' ? i.downvotesCount : 0,
    commentsCount: typeof i.commentsCount === 'number' ? i.commentsCount : 0,
    userVote: userVoteMap[String(i._id)] || 0,
    imageUrl: buildImageUrl(i.image, host),
  };
};

// -------------------- ROUTES --------------------

// ✅ Get all issues (Reddit-style Feed: sort, filter, search, pagination, optionalAuth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { sort = 'latest', category, status, search, page = 1, limit = 15 } = req.query;

    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { landmark: regex },
        { pincode: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    let sortOptions = { date: -1 };
    if (sort === 'popular') {
      sortOptions = { score: -1, date: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { date: 1 };
    }

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .populate('user', 'name email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Issue.countDocuments(filter),
    ]);

    // If user is logged in, look up their votes for these issues
    let userVoteMap = {};
    if (req.user && issues.length > 0) {
      const issueIds = issues.map((i) => i._id);
      const userVotes = await Vote.find({
        issue: { $in: issueIds },
        user: req.user.id,
      }).lean();

      userVotes.forEach((v) => {
        userVoteMap[String(v.issue)] = v.value;
      });
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const formatted = issues.map((i) => formatIssue(i, host, userVoteMap));

    res.json({
      issues: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasMore: skip + issues.length < total,
    });
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Server error fetching issues' });
  }
});

// ✅ Get issues reported by logged-in user
router.get('/my', verifyUser, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const issues = await Issue.find({ user: userId })
      .populate('user', 'name email')
      .sort({ date: -1 })
      .lean();

    let userVoteMap = {};
    if (issues.length > 0) {
      const issueIds = issues.map((i) => i._id);
      const userVotes = await Vote.find({
        issue: { $in: issueIds },
        user: req.user.id,
      }).lean();

      userVotes.forEach((v) => {
        userVoteMap[String(v.issue)] = v.value;
      });
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const withUrls = issues.map((i) => formatIssue(i, host, userVoteMap));
    res.json(withUrls);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user issues' });
  }
});

// ✅ Get single issue details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = await Issue.findById(req.params.id)
      .populate('user', 'name email role bio')
      .lean();

    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    let userVote = 0;
    if (req.user) {
      const vote = await Vote.findOne({
        issue: issue._id,
        user: req.user.id,
      }).lean();
      if (vote) userVote = vote.value;
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const userVoteMap = { [String(issue._id)]: userVote };

    res.json(formatIssue(issue, host, userVoteMap));
  } catch (err) {
    console.error('Error fetching issue:', err);
    res.status(500).json({ error: 'Server error fetching issue' });
  }
});

// ✅ Add new issue (Citizens & Admins)
router.post(
  '/',
  verifyUser,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Image size exceeds 2MB limit' });
        }
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      next();
    });
  },
  async (req, res) => {
    const { title, description, category, landmark, pincode, status, date } = req.body;

    if (!title || !description || !category || !landmark || !pincode) {
      return res.status(400).json({
        error: 'All fields (title, description, category, landmark, pincode) are required',
      });
    }

    try {
      let imageValue = null;
      if (req.file) {
        try {
          const uploadResult = await uploadImage(req.file);
          imageValue = uploadResult.url;
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr.message);
          return res.status(500).json({
            error: `Image upload failed: ${uploadErr.message}. The issue was not created.`,
          });
        }
      }

      const issueDate = date ? new Date(date) : new Date();

      const newIssue = new Issue({
        title: title.trim(),
        description: description.trim(),
        category,
        landmark: landmark.trim(),
        pincode: pincode.trim(),
        status: status || 'Pending',
        date: issueDate,
        user: req.user.id,
        image: imageValue,
        score: 0,
        upvotesCount: 0,
        downvotesCount: 0,
        commentsCount: 0,
      });

      await newIssue.save();

      const host = `${req.protocol}://${req.get('host')}`;
      const imageUrl = buildImageUrl(imageValue, host);
      res.status(201).json({
        message: 'Issue created successfully',
        issue: formatIssue(newIssue, host),
        imageUrl,
      });
    } catch (err) {
      console.error('Error creating issue:', err);
      res.status(500).json({ error: 'Server error creating issue' });
    }
  }
);

// ✅ Vote on an issue (+1 upvote, -1 downvote, 0 remove vote)
router.post('/:id/vote', verifyUser, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const { value } = req.body; // 1, -1, or 0
    if (![1, -1, 0].includes(Number(value))) {
      return res.status(400).json({ error: 'Vote value must be 1, -1, or 0' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const numericValue = Number(value);
    const existingVote = await Vote.findOne({
      issue: issue._id,
      user: req.user.id,
    });

    let newUserVote = 0;

    if (numericValue === 0) {
      // Remove existing vote
      if (existingVote) {
        await Vote.deleteOne({ _id: existingVote._id });
      }
      newUserVote = 0;
    } else if (!existingVote) {
      // New vote
      await Vote.create({
        issue: issue._id,
        user: req.user.id,
        value: numericValue,
      });
      newUserVote = numericValue;

      // Send notification if upvoted and not the author
      if (numericValue === 1 && String(issue.user) !== String(req.user.id)) {
        await Notification.create({
          recipient: issue.user,
          sender: req.user.id,
          issue: issue._id,
          type: 'upvote',
          message: `Your civic report "${issue.title}" received a community upvote.`,
        }).catch((err) => console.error('Notification error:', err));
      }
    } else if (existingVote.value === numericValue) {
      // Toggle off when clicking the same vote again
      await Vote.deleteOne({ _id: existingVote._id });
      newUserVote = 0;
    } else {
      // Switch vote (e.g. from downvote to upvote or vice versa)
      existingVote.value = numericValue;
      await existingVote.save();
      newUserVote = numericValue;

      if (numericValue === 1 && String(issue.user) !== String(req.user.id)) {
        await Notification.create({
          recipient: issue.user,
          sender: req.user.id,
          issue: issue._id,
          type: 'upvote',
          message: `Your civic report "${issue.title}" received a community upvote.`,
        }).catch((err) => console.error('Notification error:', err));
      }
    }

    // Recompute total score and counts accurately from Vote collection
    const [upvotes, downvotes] = await Promise.all([
      Vote.countDocuments({ issue: issue._id, value: 1 }),
      Vote.countDocuments({ issue: issue._id, value: -1 }),
    ]);

    issue.upvotesCount = upvotes;
    issue.downvotesCount = downvotes;
    issue.score = upvotes - downvotes;
    await issue.save();

    res.json({
      score: issue.score,
      upvotesCount: issue.upvotesCount,
      downvotesCount: issue.downvotesCount,
      userVote: newUserVote,
    });
  } catch (err) {
    console.error('Error voting on issue:', err);
    res.status(500).json({ error: 'Server error processing vote' });
  }
});

// ✅ Get comments for an issue
router.get('/:id/comments', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const comments = await Comment.find({ issue: req.params.id })
      .populate('user', 'name role email')
      .sort({ createdAt: 1 })
      .lean();

    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Server error fetching comments' });
  }
});

// ✅ Post a comment on an issue
router.post('/:id/comments', verifyUser, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const { content, parentComment } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    let parentId = null;
    if (parentComment && mongoose.Types.ObjectId.isValid(parentComment)) {
      parentId = parentComment;
    }

    const comment = new Comment({
      issue: issue._id,
      user: req.user.id,
      content: content.trim(),
      parentComment: parentId,
    });

    await comment.save();

    // Increment commentsCount on issue
    const totalComments = await Comment.countDocuments({ issue: issue._id });
    issue.commentsCount = totalComments;
    await issue.save();

    // Notify issue author if commenter is someone else
    if (String(issue.user) !== String(req.user.id)) {
      await Notification.create({
        recipient: issue.user,
        sender: req.user.id,
        issue: issue._id,
        type: 'comment',
        message: `New comment on your report "${issue.title}": "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
      }).catch((err) => console.error('Notification error:', err));
    }

    // Return populated comment
    const populated = await Comment.findById(comment._id).populate('user', 'name role email');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error adding comment' });
  }
});

// ✅ Delete comment (Author or Admin)
router.delete('/:id/comments/:commentId', verifyUser, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // Only comment author or admin can delete
    if (String(comment.user) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await Comment.deleteOne({ _id: comment._id });

    // Decrement issue commentsCount
    const totalComments = await Comment.countDocuments({ issue: req.params.id });
    await Issue.findByIdAndUpdate(req.params.id, { commentsCount: totalComments });

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting comment' });
  }
});

// ✅ Update issue status (Admin only)
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed values: ${allowed.join(', ')}` });
    }
    const updated = await Issue.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Issue not found' });

    // Send notification to author
    await Notification.create({
      recipient: updated.user,
      issue: updated._id,
      type: 'status_change',
      message: `Your civic report "${updated.title}" status was updated to "${status}".`,
    }).catch((err) => console.error('Notification error:', err));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating status' });
  }
});

// ✅ Delete issue (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Issue.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Issue not found' });

    // Clean up associated votes, comments, notifications
    await Promise.all([
      Vote.deleteMany({ issue: req.params.id }),
      Comment.deleteMany({ issue: req.params.id }),
      Notification.deleteMany({ issue: req.params.id }),
    ]);

    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting issue' });
  }
});

module.exports = router;
