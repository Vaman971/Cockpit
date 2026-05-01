const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const MissionCard = require('./missionModel');

const RevenueModel = sequelize.define(
  'revenue',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    revenueDescription: {
      field: 'revenue_description',
      type: DataTypes.STRING,
      allowNull: true,
    },
    plannedRevenue: {
      field: 'planned_revenue',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    actualRevenue: {
      field: 'actual_revenue',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    forecastRevenue: {
      field: 'forecast_revenue',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    saving: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cluster: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Other',
    },
    extension: {
      type: DataTypes.ENUM('extended', 'not extended'),
      defaultValue: 'not extended',
      allowNull: true,
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
    revenueMissionId: {
      field: 'revenue_mission_id',
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'active',
      defaultValue: true,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

//Sync the model with the database
RevenueModel.belongsTo(MissionCard, { foreignKey: 'revenueMissionId', as: 'missionRevenue' });
MissionCard.hasOne(RevenueModel, { foreignKey: 'revenueMissionId', as: 'missionRevenue' });

module.exports = RevenueModel;
