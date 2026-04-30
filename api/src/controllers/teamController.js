const MissionCard = require('../models/missionModel');
const UserProfile = require('../models/profileModel');
const Team = require('../models/TeamModel');
const UserTeams = require('../models/UserTeams');
const logger = require('../utils/logger');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const recalculateOccupancyMap = (occupancyData) => {
  const map = new Map();
  occupancyData.forEach(({ profile_id, occupancy }) => {
    map.set(profile_id, (map.get(profile_id) || 0) + Number(occupancy));
  });
  return map;
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

Team.afterUpdate(async (team) => {
  const changes = team.changed();
  if (!changes || !changes.includes('active')) {
    return;
  }

  const isActive = team.dataValues.active;
  await UserTeams.update({ active: isActive }, { where: { team_id: team.dataValues.id } });

  const occupancyData = await UserTeams.findAll({ where: { team_id: team.dataValues.id } });
  const map = recalculateOccupancyMap(occupancyData);

  for (const [profileId, occupancy] of map.entries()) {
    const profile = await UserProfile.findByPk(profileId);
    if (!profile) {
      continue;
    }
    const newOccupancy = isActive
      ? profile.total_occupancy + occupancy
      : Math.max(0, profile.total_occupancy - occupancy);
    await UserProfile.update({ total_occupancy: newOccupancy }, { where: { id: profileId } });
  }
});

UserTeams.afterSave(async (userTeam) => {
  const changes = userTeam.changed();
  if (!changes || !changes.includes('occupancy') || !userTeam.dataValues.active) {
    return;
  }

  const profiles = await UserTeams.findAll({
    where: { profile_id: userTeam.dataValues.profile_id, active: true },
  });
  const totalOccupancy = profiles.reduce((sum, p) => sum + Number(p.dataValues.occupancy), 0);
  await UserProfile.update(
    { total_occupancy: totalOccupancy },
    { where: { id: userTeam.dataValues.profile_id } }
  );
});

UserTeams.beforeDestroy(async (userTeam) => {
  const profile = await UserProfile.findByPk(userTeam.dataValues.profile_id);
  if (profile) {
    const newOccupancy = Math.max(
      0,
      profile.total_occupancy - (userTeam.dataValues.occupancy || 0)
    );
    await UserProfile.update(
      { total_occupancy: newOccupancy },
      { where: { id: userTeam.dataValues.profile_id } }
    );
  }
});

// ─── Controllers ─────────────────────────────────────────────────────────────

const updateUserTeams = async (req, res, next) => {
  try {
    const users = await UserTeams.findOne({
      where: { profile_id: req.params.profile_id, team_id: req.params.team_id },
    });
    const profile = await UserProfile.findByPk(req.params.profile_id);

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found.' });
    }
    if (!users) {
      return res.status(404).json({ success: false, error: 'User team entry not found.' });
    }
    if (req.body.occupancy > 100) {
      return res.status(400).json({ success: false, error: 'Occupancy cannot exceed 100%.' });
    }

    const projected =
      Number(profile.total_occupancy) - Number(users.occupancy) + Number(req.body.occupancy);
    if (projected > 100) {
      return res
        .status(400)
        .json({ success: false, error: 'Update would exceed max utilization (100%).' });
    }

    await UserTeams.update(req.body, {
      where: { profile_id: req.params.profile_id, team_id: req.params.team_id },
      individualHooks: true,
    });
    return res.status(200).json({ success: true, message: 'User team updated.' });
  } catch (error) {
    logger.error('updateUserTeams error:', error);
    next(error);
  }
};

const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.findAll();
    return res.status(200).json({ success: true, teams });
  } catch (error) {
    logger.error('getAllTeams error:', error);
    next(error);
  }
};

const getTeamUsers = async (req, res, next) => {
  try {
    const teamUsers = await Team.findAll({
      include: [
        { model: UserProfile, through: { model: UserTeams, attributes: [] } },
        { model: MissionCard, as: 'missionCardTeam' },
      ],
    });
    return res.status(200).json({ success: true, teams: teamUsers });
  } catch (error) {
    logger.error('getTeamUsers error:', error);
    next(error);
  }
};

const createTeam = async (req, res, next) => {
  try {
    const { mission_card_id } = req.params;
    const { team_name, active, users } = req.body;

    let team = await Team.findOne({ where: { mission_card_team_id: mission_card_id } });
    if (!team) {
      team = await Team.create({ mission_card_team_id: mission_card_id, team_name, active });
    }

    await Promise.all(
      users.map(async (user) => {
        const existingUser = await UserProfile.findByPk(user.id);
        if (!existingUser) {
          return;
        }
        if (existingUser.total_occupancy >= 100) {
          throw new Error(`User ${user.id} is at max utilization.`);
        }
        const exists = await UserTeams.findOne({
          where: { profile_id: existingUser.id, team_id: team.id },
        });
        if (!exists) {
          await UserTeams.create({
            profile_id: existingUser.id,
            team_id: team.id,
            active: user.active,
          });
        }
      })
    );

    return res.status(201).json({ success: true, message: 'Team created and users added.' });
  } catch (error) {
    logger.error('createTeam error:', error);
    if (error.message.includes('max utilization')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findOne({
      where: { mission_card_team_id: req.params.id },
      include: [
        { model: MissionCard, as: 'missionCardTeam' },
        { model: UserProfile, through: { model: UserTeams }, as: 'Profiles' },
      ],
    });
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found.' });
    }
    return res.status(200).json({ success: true, team });
  } catch (error) {
    logger.error('getTeamById error:', error);
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found.' });
    }
    await team.update(
      { team_name: req.body.team_name, active: req.body.active },
      { individualHooks: true }
    );
    return res.status(200).json({ success: true, team });
  } catch (error) {
    logger.error('updateTeam error:', error);
    next(error);
  }
};

const addUsersToTeam = async (req, res, next) => {
  const { teamId } = req.params;
  const { userIds } = req.body;
  try {
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found.' });
    }

    await Promise.all(
      userIds.map(async (userId) => {
        const user = await UserProfile.findByPk(userId);
        if (!user) {
          return;
        }
        if (user.total_occupancy >= 100) {
          throw new Error(`User ${userId} is at max utilization.`);
        }
        const exists = await UserTeams.findOne({ where: { profile_id: userId, team_id: teamId } });
        if (exists) {
          throw new Error(`User ${userId} already exists in this team.`);
        }
        await UserTeams.create({ profile_id: userId, team_id: teamId, active: true });
      })
    );

    return res.status(200).json({ success: true, message: 'Users added to the team.' });
  } catch (error) {
    logger.error('addUsersToTeam error:', error);
    if (error.message.includes('max utilization') || error.message.includes('already exists')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
};

const deleteUserFromTeam = async (req, res, next) => {
  const { teamId, userId } = req.params;
  try {
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found.' });
    }
    const user = await UserProfile.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    await UserTeams.destroy({
      where: { profile_id: userId, team_id: teamId },
      individualHooks: true,
    });
    return res.status(200).json({ success: true, message: 'User removed from team.' });
  } catch (error) {
    logger.error('deleteUserFromTeam error:', error);
    next(error);
  }
};

const deleteTeamMembers = async (req, res, next) => {
  const { team_id, users } = req.body;
  try {
    await Promise.all(
      users.map(({ profile_id }) =>
        UserTeams.destroy({ where: { team_id, profile_id }, individualHooks: true })
      )
    );
    return res.status(200).json({ success: true, message: 'Users removed from team.' });
  } catch (error) {
    logger.error('deleteTeamMembers error:', error);
    next(error);
  }
};

module.exports = {
  getAllTeams,
  getTeamUsers,
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeamMembers,
  addUsersToTeam,
  deleteUserFromTeam,
  updateUserTeams,
};
