const mongoose = require('mongoose');
const logger = require('../utils/logger').logger;
const config = require('./env');

/**
 * Helper to mask credentials in MongoDB URI before logging.
 */
function maskMongoUri(uri) {
  if (!uri) return '';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

/**
 * Connect to MongoDB via Mongoose with retries and clear diagnostics.
 * Sets up event listeners and graceful-shutdown hooks.
 */
async function connectDB(retries = 3, delayMs = 2500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(config.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      return;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) {
        logger.error('❌ Could not connect to MongoDB after multiple attempts.');
        logger.error('If using MongoDB Atlas free cluster, verify:');
        logger.error('  1. Network Access: Ensure 0.0.0.0/0 is added to IP Access List in Atlas.');
        logger.error('  2. Credentials: Username and password are correct; special characters in password (@, #, :, /, etc.) MUST be percent-encoded.');
        logger.error('  3. Environment: MONGODB_URI is set correctly in your Render dashboard.');
        process.exit(1);
      }
      logger.info(`Retrying MongoDB connection in ${delayMs / 1000}s...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

// ── Connection event listeners ───────────────────────────────────────
mongoose.connection.on('connected', () => {
  logger.info(`MongoDB connected → ${maskMongoUri(config.MONGODB_URI)}`);
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
