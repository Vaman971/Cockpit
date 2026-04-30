const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware: Verifies the JWT from the httpOnly cookie.
 *
 * - 401 if no token is present
 * - 401 if token is invalid or expired
 * - 403 if user account is inactive
 */
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: 'Authentication required. No token found.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.warn(`Token verification failed: ${err.message}`);
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }

    if (decoded.active === false) {
      return res.status(403).json({ success: false, error: 'Account is inactive.' });
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
