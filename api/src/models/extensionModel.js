/**
 * Extension model — JS variable/file renamed from 'extention' to 'extension'.
 * DB table name 'extention' is intentionally preserved for backward compatibility.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const Project = require('./projectModel');
const User = require('./userModel');

const ExtensionModel = sequelize.define(
  'extention',
  {
    // table name kept for DB compat
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    revenueProjection: {
      field: 'revenue_projection',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    projectLeader: {
      field: 'project_leader',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    currencyCode: {
      field: 'currency_code',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'EUR',
    },
    actualRevenue: {
      field: 'actual_revenue',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cluster: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Other' },
    extensionStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'extention_start_date', // DB column kept for compat
      defaultValue: null,
    },
    extensionEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'extention_end_date', // DB column kept for compat
      defaultValue: null,
    },
    region: { type: DataTypes.STRING, allowNull: true, defaultValue: 'NA' },
    siglum: { type: DataTypes.STRING, allowNull: true },
    extensionProjectId: {
      field: 'extention_project_id', // DB column kept for compat
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: { field: 'created_at', type: DataTypes.DATEONLY, allowNull: true },
    likeliness: {
      type: DataTypes.ENUM('High', 'Medium', 'Low'),
      defaultValue: 'Low',
      allowNull: false,
    },
  },
  { timestamps: false }
);

ExtensionModel.belongsTo(Project, { foreignKey: 'extensionProjectId', as: 'projectExtension' });
ExtensionModel.belongsTo(User, { foreignKey: 'projectLeader', as: 'assignedExtensionLeader' });
Project.hasOne(ExtensionModel, { foreignKey: 'extensionProjectId', as: 'projectExtension' });
// NOTE: User.hasOne(ExtensionModel) omitted — extentionModel.js registers assignedProjectLeader
//       on User during migration period. Remove this comment once old model is deleted.

module.exports = ExtensionModel;
