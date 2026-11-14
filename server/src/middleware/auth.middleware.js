const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

/**
 * Authenticate incoming requests via a Bearer JWT in the
 * Authorization header. Attaches `req.user` on success.
 */
function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token is missing');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Attach essential claims to the request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err instanceof ApiError) {
      return next(err);
    }
    // jwt.verify may throw JsonWebTokenError / TokenExpiredError
    return next(err);
  }
}

/**
 * Authorize access based on user roles.
 * Must be used **after** `authenticate`.
 *
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'user')
 * @returns {import('express').RequestHandler}
 */
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role "${req.user.role}" is not authorized to access this resource`,
        ),
      );
    }

    next();
  };
}

module.exports = { authenticate, authorize };
