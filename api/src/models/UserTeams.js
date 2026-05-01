const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const UserProfile = require('../models/profileModel');
const Team = require('../models/TeamModel');

// Define the UserTeams model
const UserTeams = sequelize.define(
  'UserTeams',
  {
    profile_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: UserProfile,
        key: 'id',
      },
    },
    team_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Team,
        key: 'id',
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    occupancy: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

// Sync the model with the database if needed
module.exports = UserTeams;
