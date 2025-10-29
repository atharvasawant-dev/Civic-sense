const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  landmark: { type: String, required: true },
  pincode: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String },
});

module.exports = mongoose.model('Issue', issueSchema);
