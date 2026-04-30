const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const User = require('./userModel');

const Oppurtunity = sequelize.define(
  'oppurtunities',
  {
    id: {
      field: 'id', // db column name
      type: Sequelize.BIGINT, // db column type
      primaryKey: true, // primary key / not
      allowNull: false, // can it be null / not_null
      autoIncrement: true, // autoIncrement true for PK
    },
    OpRegion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    OpUnit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    OpDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    AssociatedWP: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CustomerContactPoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Siglum: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Program: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Priority: {
      type: DataTypes.ENUM,
      values: ['High', 'Medium', 'Low', 'NA'],
      defaultValue: 'Low',
      allowNull: true,
    },
    opportunityType: {
      type: DataTypes.ENUM,
      values: ['External', 'Internal'],
      defaultValue: 'External',
    },
    Confidence: {
      type: DataTypes.ENUM,
      values: ['High', 'Medium', 'Low', 'NA'],
      defaultValue: 'High',
      allowNull: true,
    },
    FirstContactDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    LatestContactDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    NextContactDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Prospection: {
    //   type: DataTypes.STRING,
    //   allowNull: true
    // },
    // Definition: {
    //   type: DataTypes.STRING,
    //   allowNull: true
    // },
    // Proposition: {
    //   type: DataTypes.STRING,
    //   allowNull: true
    // },
    // Execution: {
    //   type: DataTypes.STRING,
    //   allowNull: true
    // },
    status: {
      type: DataTypes.ENUM,
      values: ['Prospection', 'Advanced', 'Proposal', 'Won', 'Lost', 'Hold'],
      defaultValue: 'Prospection',
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM,
      values: ['Sales', 'New MC', 'Old MC', 'Workshop', 'Customer Contact'],
      defaultValue: 'Sales',
      allowNull: true,
    },
    ExpectedDealSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ExpectedTeamSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cluster: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Other',
    },
    ledBy: {
      field: 'led_by',
      type: Sequelize.INTEGER,
    },
    supportedBy: {
      field: 'supported_by',
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    MarkedOpp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    MissionStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    MissionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comments: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    currencyCode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'EUR',
    },
  },
  {
    timestamps: false,
  }
);
//mapping with respect to user and oppurtunity
Oppurtunity.belongsTo(User, {
  foreignKey: 'ledBy',
  as: 'ledByUser',
});

Oppurtunity.belongsTo(User, {
  foreignKey: 'supportedBy',
  as: 'supportedByUser',
});

User.hasMany(Oppurtunity, { foreignKey: 'ledBy', as: 'ledByUser' });
User.hasMany(Oppurtunity, { foreignKey: 'supportedBy', as: 'supportedByUser' });

module.exports = Oppurtunity;
