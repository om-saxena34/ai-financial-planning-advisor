/**
 * @module ApiResponse
 * Uniform success-response helpers used across all controllers.
 */
class ApiResponse {
  /**
   * Standard success response.
   * @param {import('express').Response} res
   * @param {*}      data       - Payload
   * @param {string} [message]  - Human-readable message
   * @param {number} [statusCode=200]
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * 201 Created response.
   * @param {import('express').Response} res
   * @param {*}      data
   * @param {string} [message]
   */
  static created(res, data, message = 'Resource created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Paginated list response.
   * @param {import('express').Response} res
   * @param {Array}  data
   * @param {Object} pagination - { page, limit, total, totalPages }
   * @param {string} [message]
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

module.exports = ApiResponse;
