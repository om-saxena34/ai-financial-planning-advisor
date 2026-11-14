const mongoose = require('mongoose');
const logger = require('../utils/logger').logger;
const config = require('./env');

/**
 * Connect to MongoDB via Mongoose.
 * Sets up event listeners and graceful-shutdown hooks.
 */
async function connectDB() {
  try {
    await mongoose.connect(config.MONGODB_URI);
  } catch (err) {
    logger.error(`MongoDB initial connection error: ${err.message}`);
    process.exit(1);
  }
}

// ── Connection event listeners ───────────────────────────────────────
mongoose.connection.on('connected', () => {
  logger.info(`MongoDB connected → ${config.MONGODB_URI}`);
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

// ── Graceful shutdown ────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received – closing MongoDB connection…`);
  await mongoose.connection.close();
  logger.info('MongoDB connection closed through app termination');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
