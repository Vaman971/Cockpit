const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware: Verifies JWT and enforces Leader/Admin authorization.
 *
 * - 401 if no token or invalid/expired token
 * - 403 if user is not a Leader or Admin
 */
const verifyAuth = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: 'Authentication required. No token found.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.warn(`Auth verification failed: ${err.message}`);
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }

    req.user = decoded;

    if (decoded.user_type === 'Leader' || decoded.user_type === 'Admin') {
      return next();
    }

    return res.status(403).json({ success: false, error: 'Forbidden. Insufficient permissions.' });
  });
};

module.exports = verifyAuth;
