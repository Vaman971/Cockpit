const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const Oppurtunity = require('./opportunityModel');
const User = require('./userModel');

const Project = sequelize.define(
  'projects',
  {
    id: {
      field: 'id', // db column name
      type: Sequelize.BIGINT, // db column type
      primaryKey: true, // primary key / not
      allowNull: false, // can it be null / not_null
      autoIncrement: true, // autoIncrement true for PK
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'NA',
    },
    project_title: {
      field: 'project_title',
      type: DataTypes.STRING,
      allowNull: true,
    },
    projectLead: {
      field: 'project_lead',
      type: DataTypes.INTEGER,
    },
    oppurtunity_id: {
      field: 'oppurtunity_id',
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    projectType: {
      field: 'project_type',
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
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: false,
  }
);
Project.belongsTo(Oppurtunity, {
  foreignKey: 'oppurtunity_id',
  as: 'ProjOpp',
});
Oppurtunity.hasOne(Project, {
  foreignKey: 'oppurtunity_id',
  as: 'ProjOpp',
});
Project.belongsTo(User, {
  foreignKey: 'projectLead',
  targetKey: 'user_id',
  as: 'leadUser',
});

module.exports = Project;
