const { Op } = require('sequelize');
const UserProfile = require('../models/profileModel');
const User = require('../models/userModel');
const UserTeams = require('../models/UserTeams');
const Team = require('../models/TeamModel');
const MissionCard = require('../models/missionModel');
const logger = require('../utils/logger');

// ─── Hooks ───────────────────────────────────────────────────────────────────

User.afterCreate(async (user) => {
  try {
    await UserProfile.create({
      username: user.username,
      email: user.email,
      designation: null,
      bio: null,
      location: null,
      profileImage: null,
      userProfileId: user.user_id,
    });
  } catch (error) {
    logger.error('Error creating user profile on afterCreate:', error);
  }
});

User.afterUpdate(async (user) => {
  try {
    const changes = user.changed();
    const relevantFields = ['username', 'email', 'burden_rate'];
    const changed = relevantFields.filter((f) => changes.includes(f));
    if (changed.length === 0) {
      return;
    }

    const updates = {};
    if (changes.includes('username')) {
      updates.username = user.dataValues.username;
    }
    if (changes.includes('email')) {
      updates.email = user.dataValues.email;
    }
    if (changes.includes('burden_rate')) {
      updates.burden_rate = user.dataValues.burden_rate;
    }

    const [profile] = await UserProfile.findAll({ where: { userProfileId: user.user_id } });
    if (profile) {
      await profile.update(updates);
    }
  } catch (error) {
    logger.error('Error updating user profile on afterUpdate:', error);
  }
});

// ─── Controllers ─────────────────────────────────────────────────────────────

const updateProfile = async (req, res, next) => {
  try {
    const { email, designation, contactDetails, bio, location, firstName, lastName, contactCode } =
      req.body;
    const fieldsToUpdate = {
      firstName,
      lastName,
      email,
      designation,
      bio,
      location,
      contactDetails,
      contactCode,
    };
    if (req.file) {
      fieldsToUpdate.profileImage = req.file.buffer;
    }

    const [rowsUpdated] = await UserProfile.update(fieldsToUpdate, {
      where: { username: req.params.username },
    });
    if (rowsUpdated === 0) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }
    const updated = await UserProfile.findOne({ where: { username: req.params.username } });
    return res.status(200).json({ success: true, userProfile: updated });
  } catch (error) {
    logger.error('updateProfile error:', error);
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userProfile = await UserProfile.findOne({
      where: { username: req.params.username },
      attributes: { exclude: ['burden_rate'] },
    });
    if (!userProfile) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }
    const imageData = userProfile.profileImage
      ? Buffer.from(userProfile.profileImage, 'base64').toString('base64')
      : null;
    return res
      .status(200)
      .json({ success: true, userProfile: { ...userProfile.toJSON(), profileImage: imageData } });
  } catch (error) {
    logger.error('getProfile error:', error);
    next(error);
  }
};

const getAllProfile = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res
        .status(400)
        .json({ success: false, error: 'Username query parameter is required.' });
    }
    const userProfiles = await UserProfile.findAll({
      where: { username: { [Op.like]: `%${username}%` } },
      attributes: { exclude: ['burden_rate'] },
    });
    if (userProfiles.length === 0) {
      return res.status(404).json({ success: false, error: 'No profiles found.' });
    }
    const profilesWithImages = userProfiles.map((profile) => ({
      ...profile.toJSON(),
      profileImage: profile.profileImage
        ? Buffer.from(profile.profileImage, 'base64').toString('base64')
        : null,
    }));
    return res.status(200).json({ success: true, userProfiles: profilesWithImages });
  } catch (error) {
    logger.error('getAllProfile error:', error);
    next(error);
  }
};

const getProfiles = async (req, res, next) => {
  try {
    const userProfiles = await UserProfile.findAll({ attributes: { exclude: ['burden_rate'] } });
    return res.status(200).json({ success: true, userProfiles });
  } catch (error) {
    logger.error('getProfiles error:', error);
    next(error);
  }
};

const getProfileDetails = async (req, res, next) => {
  try {
    const userProfiles = await UserProfile.findAll({
      attributes: [
        'id',
        'username',
        'contactDetails',
        'total_occupancy',
        'userProfileId',
        'designation',
        'location',
      ],
    });
    if (userProfiles.length === 0) {
      return res.status(404).json({ success: false, error: 'No profiles found.' });
    }

    const allUserMissionData = await Promise.all(
      userProfiles.map(async (userProfile) => {
        const userTeams = await UserTeams.findAll({ where: { profile_id: userProfile.id } });
        const missionData = (
          await Promise.all(
            userTeams.map(async (userTeam) => {
              const team = await Team.findByPk(userTeam.team_id);
              if (!team) {
                return null;
              }
              const missionCard = await MissionCard.findByPk(team.mission_card_team_id, {
                attributes: ['airbusId'],
              });
              if (!missionCard) {
                return null;
              }
              return {
                id: team.mission_card_team_id,
                missionId: missionCard.airbusId,
                individualOccupancy: userTeam.occupancy,
                active: userTeam.active,
              };
            })
          )
        ).filter(Boolean);

        return {
          id: userProfile.id,
          userId: userProfile.userProfileId,
          username: userProfile.username,
          contactDetails: userProfile.contactDetails,
          totalOccupancy: userProfile.total_occupancy,
          location: userProfile.location,
          designation: userProfile.designation,
          missions: missionData,
        };
      })
    );

    return res.status(200).json({ success: true, profiles: allUserMissionData });
  } catch (error) {
    logger.error('getProfileDetails error:', error);
    next(error);
  }
};

const getSingleProfileDetails = async (req, res, next) => {
  try {
    const userProfile = await UserProfile.findOne({
      where: { userProfileId: req.params.userId },
      attributes: [
        'id',
        'username',
        'contactDetails',
        'total_occupancy',
        'profileImage',
        'designation',
        'location',
        'email',
        'contactCode',
      ],
    });
    if (!userProfile) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const userTeams = await UserTeams.findAll({ where: { profile_id: userProfile.id } });
    const base = {
      profileImage: userProfile.profileImage,
      location: userProfile.location,
      email: userProfile.email,
      designation: userProfile.designation,
      username: userProfile.username,
      contactDetails: userProfile.contactDetails,
      contactCode: userProfile.contactCode,
      totalOccupancy: userProfile.total_occupancy,
    };

    if (userTeams.length === 0) {
      return res.status(200).json({ success: true, ...base });
    }

    const missionData = (
      await Promise.all(
        userTeams.map(async (userTeam) => {
          const team = await Team.findByPk(userTeam.team_id);
          if (!team) {
            return null;
          }
          const mc = await MissionCard.findByPk(team.mission_card_team_id, {
            attributes: [
              'id',
              'airbusId',
              'missionDescription',
              'missionStartDate',
              'missionEndDate',
              'status',
            ],
          });
          if (!mc) {
            return null;
          }

          const start = new Date(mc.missionStartDate);
          const end = new Date(mc.missionEndDate);
          const months = Math.max(
            1,
            (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
          );

          return {
            missionId: mc.airbusId,
            duration: months,
            description: mc.missionDescription,
            individualOccupancy: userTeam.occupancy,
            status: mc.status,
            active: userTeam.active,
            id: mc.id,
          };
        })
      )
    ).filter(Boolean);

    return res.status(200).json({ success: true, ...base, missions: missionData });
  } catch (error) {
    logger.error('getSingleProfileDetails error:', error);
    next(error);
  }
};

module.exports = {
  updateProfile,
  getProfile,
  getAllProfile,
  getProfiles,
  getProfileDetails,
  getSingleProfileDetails,
};
