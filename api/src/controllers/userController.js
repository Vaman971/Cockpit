const User = require('../models/userModel');
const UserDto = require('../Dto/userDto');
const bcrypt = require('bcryptjs');
const MissionCard = require('../models/missionModel');
const PurchaseOrder = require('../models/poModel');
const logger = require('../utils/logger');

// ─── Sequelize Hooks ──────────────────────────────────────────────────────────

User.beforeCreate(async (user) => {
  user.password = bcrypt.hashSync(user.password, 10);
});

User.beforeUpdate(async (user) => {
  const changes = user.changed();
  if (changes && changes.includes('password')) {
    user.password = bcrypt.hashSync(user.password, 10);
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isAllowedEmailDomain = (email) => {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'tatatechnologies.com';
  const domain = email.substring(email.indexOf('@') + 1);
  return domain.includes(allowedDomain);
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /users/createUser
 * Creates a new user. Requires Leader/Admin role.
 */
const createUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!isAllowedEmailDomain(email)) {
      return res.status(400).json({
        success: false,
        error: `Email must be from the ${process.env.ALLOWED_EMAIL_DOMAIN || 'tatatechnologies.com'} domain.`,
      });
    }

    const user = await User.create(req.body);
    const userDto = UserDto.fromModel(user);
    return res.status(201).json({ success: true, user: userDto });
  } catch (error) {
    logger.error('createUser error:', error);
    next(error);
  }
};

/**
 * POST /users/signUser  (legacy public sign-up — consider removing if not needed)
 */
const signUser = async (req, res, next) => {
  try {
    const { username, email, password, user_type } = req.body;
    const hashedPwd = bcrypt.hashSync(password, 10);
    const userDetails = await User.create({ username, email, password: hashedPwd, user_type });
    return res.status(201).json({ success: true, user: userDetails });
  } catch (error) {
    logger.error('signUser error:', error);
    next(error);
  }
};

/**
 * PUT /users/updateUser/:id
 * Updates a user. Requires Leader/Admin role.
 */
const updateUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (email && !isAllowedEmailDomain(email)) {
      return res.status(400).json({
        success: false,
        error: `Email must be from the ${process.env.ALLOWED_EMAIL_DOMAIN || 'tatatechnologies.com'} domain.`,
      });
    }

    const [rowsUpdated] = await User.update(req.body, {
      where: { user_id: req.params.id },
      individualHooks: true,
    });

    if (rowsUpdated === 0) {
      return res.status(404).json({ success: false, error: 'User not found or no changes made.' });
    }

    const updatedUser = await User.findOne({
      where: { user_id: req.params.id },
      attributes: { exclude: ['password'] },
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    logger.error('updateUser error:', error);
    next(error);
  }
};

/**
 * PUT /users/updatePassword/:user_id
 * Allows a user to update their own password.
 */
const updatePassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;

    const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error:
          'Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number, and special character.',
      });
    }

    const userData = await User.findOne({ where: { user_id: req.params.user_id } });
    if (!userData) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, userData.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    }

    const hashedNewPwd = await bcrypt.hash(newPassword, 10);
    const [rowsUpdated] = await User.update(
      { password: hashedNewPwd },
      { where: { user_id: req.params.user_id } }
    );

    if (rowsUpdated === 0) {
      return res.status(404).json({ success: false, error: 'Password update failed.' });
    }

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    logger.error('updatePassword error:', error);
    next(error);
  }
};

/**
 * GET /users/getUserbyId/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { user_id: req.params.id },
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error('getUserById error:', error);
    next(error);
  }
};

/**
 * GET /users/getusers
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    const userDTOs = users.map((user) => UserDto.fromModel(user));
    return res.status(200).json({ success: true, users: userDTOs });
  } catch (error) {
    logger.error('getUsers error:', error);
    next(error);
  }
};

/**
 * GET /users/getuserDetails — returns users without burden_rate
 */
const getUserDetails = async (req, res, next) => {
  try {
    const users = await User.findAll();
    const userDTOs = users.map((user) => {
      const { burden_rate, ...rest } = UserDto.fromModel(user);
      return rest;
    });
    return res.status(200).json({ success: true, users: userDTOs });
  } catch (error) {
    logger.error('getUserDetails error:', error);
    next(error);
  }
};

/**
 * GET /users/getmissionDetails?leader=<userId>
 */
const getMissionDetails = async (req, res, next) => {
  try {
    const { leader } = req.query;

    if (!leader) {
      return res.status(400).json({ success: false, error: 'Leader query parameter is required.' });
    }

    const missions = await MissionCard.findAll({
      where: { missionCardLeader: leader },
      include: [{ model: PurchaseOrder, as: 'projectPo' }],
    });

    if (!missions || missions.length === 0) {
      return res.status(404).json({ success: false, error: 'No missions found for this leader.' });
    }

    return res.status(200).json({ success: true, missions });
  } catch (error) {
    logger.error('getMissionDetails error:', error);
    next(error);
  }
};

module.exports = {
  createUser,
  updateUser,
  getUserById,
  getUsers,
  updatePassword,
  signUser,
  getUserDetails,
  getMissionDetails,
};
