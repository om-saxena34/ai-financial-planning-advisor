const mongoose = require('mongoose');

/**
 * PredictionLog Schema
 * Tracks inference requests, feature snapshots, model outputs,
 * versioning, and whether rule-based fallback was triggered.
 */
const predictionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['classification', 'forecast'],
      required: true,
      index: true,
    },
    inputSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    modelVersion: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    source: {
      type: String,
      enum: ['ml_service', 'fallback_rule_engine'],
      default: 'ml_service',
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a user's recent predictions by type
predictionLogSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('PredictionLog', predictionLogSchema);
