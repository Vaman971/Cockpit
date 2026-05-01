const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const Project = require('./projectModel');
const User = require('./userModel');
const Customer = require('./customerModel');
const MissionCardCustomer = require('./missionCardCustomerModel');

const MissionCard = sequelize.define(
  'missionCard',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'id', // Column name in the database
    },
    airbusId: {
      type: DataTypes.STRING,
      unique: true,
      field: 'airbus_id',
    },
    missionDescription: {
      type: DataTypes.TEXT,
      field: 'mission_description',
      allowNull: true,
    },
    missionCardLeader: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'mission_card_leader',
      default: null,
    },
    missionCardDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'mission_card_duration',
      default: null,
    },
    missionStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'mission_start_date',
      defaultValue: DataTypes.NOW,
    },
    missionEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'mission_end_date',
      defaultValue: null,
    },
    projMissionId: {
      field: 'proj_mission_id',
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    missionCardTeam: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mission_card_team',
    },
    status: {
      type: DataTypes.ENUM,
      values: ['Yet to Start', 'In Progress', 'Closed'],
      defaultValue: 'Yet to Start',
    },
    missionType: {
      field: 'mission_type',
      type: DataTypes.ENUM,
      values: ['External', 'Internal'],
      defaultValue: 'External',
    },
    cluster: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Other',
    },
    siglum: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'NA',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'active',
      defaultValue: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      defaultValue: Sequelize.NOW,
    },
  },
  { timestamps: false }
);
MissionCard.belongsTo(Project, {
  foreignKey: 'projMissionId',
  as: 'missionCards',
});

MissionCard.belongsTo(User, {
  foreignKey: 'missionCardLeader',
  as: 'assignedMissionCards',
});

Project.hasMany(MissionCard, { foreignKey: 'projMissionId', as: 'missionCards' });
User.hasMany(MissionCard, { foreignKey: 'missionCardLeader', as: 'assignedMissionCards' });
MissionCard.belongsToMany(Customer, {
  through: MissionCardCustomer,
  foreignKey: 'missionCardId',
  otherKey: 'customerId',
  as: 'customers',
});
Customer.belongsToMany(MissionCard, {
  through: MissionCardCustomer,
  foreignKey: 'customerId',
  otherKey: 'missionCardId',
  as: 'missionCards',
});

module.exports = MissionCard;
