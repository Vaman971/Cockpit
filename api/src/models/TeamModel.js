const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const UserProfile = require('./profileModel');
const MissionCard = require('./missionModel');

const Team = sequelize.define(
  'team',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'id',
    },
    team_name: {
      type: DataTypes.STRING,
      field: 'team_name',
      allowNull: false,
    },
    cluster: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Other',
    },
    mission_card_team_id: {
      type: DataTypes.BIGINT,
      field: 'mission_card_team_id',
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'active',
      defaultValue: true,
    },
  },
  { timestamps: false }
);

Team.belongsTo(MissionCard, { foreignKey: 'mission_card_team_id', as: 'missionCardTeam' });

Team.belongsToMany(UserProfile, { through: 'UserTeams', foreignKey: 'team_id' });
UserProfile.belongsToMany(Team, { through: 'UserTeams', foreignKey: 'profile_id' });
module.exports = Team;
