const mongoose = require('mongoose');

/**
 * CategoryRule — per-user merchant → category mapping corrections.
 * When a user corrects a category, we learn it for future uploads.
 */
const categoryRuleSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  keyword:          { type: String, required: true, lowercase: true, trim: true },
  assignedCategory: { type: String, required: true },
}, { timestamps: true });

categoryRuleSchema.index({ userId: 1, keyword: 1 }, { unique: true });

module.exports = mongoose.model('CategoryRule', categoryRuleSchema);
