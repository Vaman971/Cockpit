const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for authentication endpoints.
 * Allows max 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: false,
});

/**
 * General API rate limiter.
 * Allows max 200 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests. Please slow down.',
  },
});

module.exports = { authLimiter, apiLimiter };
