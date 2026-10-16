// server/models/Vote.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    value: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  { timestamps: true }
);

voteSchema.index({ issue: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
