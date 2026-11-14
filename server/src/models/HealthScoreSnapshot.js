const mongoose = require('mongoose');

const healthScoreSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: 0,
      max: 100,
    },
    band: {
      type: String,
      enum: ['Poor', 'Fair', 'Good', 'Excellent'],
      required: true,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    summary: {
      type: String,
      default: '',
    },
    components: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

healthScoreSnapshotSchema.index({ userId: 1, date: -1 });

healthScoreSnapshotSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const HealthScoreSnapshot = mongoose.model(
  'HealthScoreSnapshot',
  healthScoreSnapshotSchema
);

module.exports = HealthScoreSnapshot;
