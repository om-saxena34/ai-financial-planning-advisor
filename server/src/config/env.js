const path = require('path');
const dotenv = require('dotenv');

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_JWT_SECRET = 'dev-secret-change-me';

/**
 * Application configuration loaded from environment variables.
 * Frozen to prevent accidental mutation at runtime.
 */
const config = Object.freeze({
  /** Server port */
  PORT: parseInt(process.env.PORT, 10) || 5000,

  /** MongoDB connection URI */
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/financial_advisor',

  /** Secret used to sign JWTs */
  JWT_SECRET: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,

  /** Access-token lifetime (e.g. "15m") */
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',

  /** Refresh-token lifetime (e.g. "7d") */
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  /** ML micro-service base URL */
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',

  /** Timeout (ms) for ML service calls */
  ML_SERVICE_TIMEOUT: parseInt(process.env.ML_SERVICE_TIMEOUT, 10) || 5000,

  /** Current environment */
  NODE_ENV: process.env.NODE_ENV || 'development',

  /** Allowed CORS origin / Frontend URL */
  CORS_ORIGIN: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',

  /** Client URL */
  CLIENT_URL: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
});

// ── Startup validation ───────────────────────────────────────────────
if (
  config.JWT_SECRET === DEFAULT_JWT_SECRET &&
  config.NODE_ENV !== 'development'
) {
  // eslint-disable-next-line no-console
  console.warn(
    '\x1b[33m⚠  WARNING: JWT_SECRET is still the default value. ' +
      'Set a strong secret before deploying to production!\x1b[0m',
  );
}

if (
  config.NODE_ENV === 'production' &&
  !process.env.MONGODB_URI
) {
  // eslint-disable-next-line no-console
  console.error(
    '\x1b[31m❌ FATAL: MONGODB_URI is missing in production mode! Please set a valid MongoDB Atlas connection string in Render environment variables.\x1b[0m',
  );
}

module.exports = config;
