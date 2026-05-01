const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const Project = require('./projectModel');
const User = require('./userModel');

const ExtentionModel = sequelize.define(
  'extention',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    revenueProjection: {
      field: 'revenue_projection',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    projectLeader: {
      field: 'project_leader',
      type: DataTypes.INTEGER,
      allowNull: true,
      default: null,
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
    cluster: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Other',
    },
    extentionStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'extention_start_date',
      defaultValue: null,
    },
    extentionEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'extention_end_date',
      defaultValue: null,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'NA',
    },
    siglum: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    extentionProjectId: {
      field: 'extention_project_id',
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    likeliness: {
      type: DataTypes.ENUM('High', 'Medium', 'Low'),
      defaultValue: 'Low',
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

ExtentionModel.belongsTo(Project, {
  foreignKey: 'extentionProjectId',
  as: 'projectExtention',
});

ExtentionModel.belongsTo(User, {
  foreignKey: 'projectLeader',
  as: 'assignedProjectLeader',
});

Project.hasOne(ExtentionModel, { foreignKey: 'extentionProjectId', as: 'projectExtention' });
User.hasOne(ExtentionModel, { foreignKey: 'projectLeader', as: 'assignedProjectLeader' });

module.exports = ExtentionModel;
