const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

/**
 * POST /auth/signIn
 * Authenticates a user and sets a secure httpOnly JWT cookie.
 */
const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.active === false) {
      return res
        .status(403)
        .json({ success: false, error: 'Account is inactive. Contact your administrator.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '48h';
    const jwtToken = jwt.sign(
      { email: user.email, user_type: user.user_type, active: user.active },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Parse expiresIn to milliseconds for cookie maxAge
    const expiryMs = 48 * 60 * 60 * 1000; // 48 hours in ms (matches default)
    const tokenExpiry = new Date(Date.now() + expiryMs);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    logger.info(`User signed in: ${user.email}`);

    res
      .status(200)
      .cookie('jwtToken', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: expiryMs,
      })
      .json({ success: true, user: userResponse, tokenExpiry });
  } catch (error) {
    logger.error('Sign-in error:', error);
    next(error); // pass to global error handler
  }
};

/**
 * POST /auth/signOut
 * Clears the JWT cookie and signs the user out.
 */
const signOut = (req, res) => {
  res
    .clearCookie('jwtToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .status(200)
    .json({ success: true, message: 'Signed out successfully.' });
  logger.info('User signed out.');
};

module.exports = { signIn, signOut };
