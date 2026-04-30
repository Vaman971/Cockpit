const express = require('express');
const { signIn, signOut } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const schemas = require('../middleware/schemas');

const router = express.Router();

// Apply strict rate limiting to all auth endpoints
router.use(authLimiter);

router.post('/signIn', validate(schemas.signIn), signIn);
router.post('/signOut', signOut);

module.exports = router;
