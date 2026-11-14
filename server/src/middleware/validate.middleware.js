const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Factory that returns Express middleware to validate a request
 * section against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [source='body'] - Request property
 *   to validate.
 * @returns {import('express').RequestHandler}
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      // Attach validated (and potentially transformed) data
      req.validated = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(
          new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details)
        );
      }
      next(err);
    }
  };
}

module.exports = validate;
