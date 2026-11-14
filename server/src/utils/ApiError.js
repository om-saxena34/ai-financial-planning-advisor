/**
 * @module ApiError
 * Custom application error with HTTP semantics.
 * Thrown in controllers / services and caught by the global error handler.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode  - HTTP status code
   * @param {string} message     - Human-readable error description
   * @param {string} [code]      - Machine-readable error code
   * @param {Array}  [details]   - Field-level validation details
   */
  constructor(statusCode, message, code = 'ERROR', details = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  /* ── Static factory methods ──────────────────────────────────── */

  /**
   * 400 Bad Request
   * @param {string} [message]
   * @param {Array}  [details]
   */
  static badRequest(
    message = 'Bad request',
    details = [],
  ) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  /** 401 Unauthorized */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  /** 403 Forbidden */
  static forbidden(message = 'Forbidden – insufficient permissions') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  /** 404 Not Found */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  /** 409 Conflict */
  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message, 'CONFLICT');
  }

  /** 500 Internal Server Error */
  static internal(message = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}

module.exports = ApiError;
