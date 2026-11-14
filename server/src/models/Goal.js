const mongoose = require('mongoose');

/**
 * Goal Schema
 * Tracks financial goals with target amounts, dates, SIP math, and feasibility status.
 */
const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: [
        'emergency_fund',
        'education',
        'travel',
        'car',
        'house',
        'retirement',
        'wedding',
        'custom',
      ],
      default: 'custom',
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [100, 'Target amount must be at least 100'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    expectedReturnRate: {
      type: Number,
      default: 10,
      min: [0, 'Return rate cannot be negative'],
      max: [30, 'Return rate cannot exceed 30%'],
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'paused', 'abandoned'],
      default: 'in_progress',
    },
    requiredMonthlySIP: {
      type: Number,
      default: 0,
    },
    currentMonthlySIP: {
      type: Number,
      default: 0,
    },
    feasibility: {
      isOnTrack: { type: Boolean, default: true },
      shortfall: { type: Number, default: 0 },
      recommendedSIP: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user goals query
goalSchema.index({ userId: 1, status: 1, targetDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
