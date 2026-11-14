const ApiError = require('../utils/ApiError');
const { logger } = require('../utils/logger');

/**
 * Global Express error-handling middleware.
 * Must be registered **after** all routes.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // ── Known application error ────────────────────────────────────
  if (err instanceof ApiError) {
    logger.warn(`ApiError ${err.statusCode} – ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details.length ? err.details : undefined,
    });
  }

  // ── Mongoose validation error ──────────────────────────────────
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    logger.warn(`Mongoose ValidationError – ${err.message}`);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details,
    });
  }

  // ── Mongoose duplicate-key error ───────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    logger.warn(`Mongoose duplicate key – ${field}`);
    return res.status(409).json({
      success: false,
      message: `Duplicate value for "${field}"`,
      code: 'CONFLICT',
    });
  }

  // ── JWT errors ─────────────────────────────────────────────────
  if (
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError'
  ) {
    const msg =
      err.name === 'TokenExpiredError'
        ? 'Token has expired'
        : 'Invalid token';
    logger.warn(`JWT error – ${err.name}: ${err.message}`);
    return res.status(401).json({
      success: false,
      message: msg,
      code: 'UNAUTHORIZED',
    });
  }

  // ── Unhandled / unknown errors ─────────────────────────────────
  logger.error(err.stack || err.message || err);

  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: isProd ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
    ...(isProd ? {} : { stack: err.stack }),
  });
}

module.exports = errorHandler;
