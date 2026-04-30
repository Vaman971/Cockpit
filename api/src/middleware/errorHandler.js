const logger = require('../utils/logger');

/**
 * Global error handler middleware.
 * Must be registered LAST in the Express middleware chain (after all routes).
 *
 * Catches all errors passed via next(err) or thrown in async handlers
 * and returns a consistent JSON error response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${req.method}] ${req.path} — ${statusCode}: ${message}`, {
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
