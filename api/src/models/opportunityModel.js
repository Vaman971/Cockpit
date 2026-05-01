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
      field: 'op_region',
      type: DataTypes.STRING,
      allowNull: false,
    },
    OpUnit: {
      field: 'op_unit',
      type: DataTypes.STRING,
      allowNull: false,
    },
    OpDescription: {
      field: 'op_description',
      type: DataTypes.STRING,
      allowNull: false,
    },
    AssociatedWP: {
      field: 'associated_w_p',
      type: DataTypes.STRING,
      allowNull: false,
    },
    CustomerContactPoint: {
      field: 'customer_contact_point',
      type: DataTypes.STRING,
      allowNull: false,
    },
    Siglum: {
      field: 'siglum',
      type: DataTypes.STRING,
      allowNull: true,
    },
    Program: {
      field: 'program',
      type: DataTypes.STRING,
      allowNull: true,
    },
    Priority: {
      field: 'priority',
      type: DataTypes.ENUM,
      values: ['High', 'Medium', 'Low', 'NA'],
      defaultValue: 'Low',
      allowNull: true,
    },
    opportunityType: {
      field: 'opportunity_type',
      type: DataTypes.ENUM,
      values: ['External', 'Internal'],
      defaultValue: 'External',
    },
    Confidence: {
      field: 'confidence',
      type: DataTypes.ENUM,
      values: ['High', 'Medium', 'Low', 'NA'],
      defaultValue: 'High',
      allowNull: true,
    },
    FirstContactDate: {
      field: 'first_contact_date',
      type: DataTypes.DATE,
      allowNull: true,
    },
    LatestContactDate: {
      field: 'latest_contact_date',
      type: DataTypes.DATE,
      allowNull: true,
    },
    NextContactDate: {
      field: 'next_contact_date',
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
      field: 'expected_deal_size',
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ExpectedTeamSize: {
      field: 'expected_team_size',
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
      field: 'created_at',
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    MarkedOpp: {
      field: 'marked_opp',
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    MissionStartDate: {
      field: 'mission_start_date',
      type: DataTypes.DATE,
      allowNull: true,
    },
    MissionEndDate: {
      field: 'mission_end_date',
      type: DataTypes.DATE,
      allowNull: true,
    },
    comments: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    currencyCode: {
      field: 'currency_code',
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
