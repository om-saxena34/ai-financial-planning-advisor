const mongoose = require('mongoose');

/**
 * UploadBatch — one bank statement CSV upload session.
 * We never store the raw file — only parsed transaction rows.
 */
const uploadBatchSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileName: { type: String, default: 'statement.csv' },
  rowCount: { type: Number, default: 0 },
  status:   { type: String, enum: ['pending','confirmed','deleted'], default: 'pending' },
  unusualSpending: [{ category: String, amount: Number, reason: String }],
}, { timestamps: true });

module.exports = mongoose.model('UploadBatch', uploadBatchSchema);
