const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

/**
 * General API rate limiter – 100 requests per 15-minute window.
 */
const generalLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      },
    });

/**
 * Stricter rate limiter for auth endpoints – 10 requests per
 * 15-minute window.
 */
const authLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many authentication attempts, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      },
    });

module.exports = { generalLimiter, authLimiter };
