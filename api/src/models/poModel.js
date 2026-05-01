const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const MissionCard = require('./missionModel');

const PurchaseOrder = sequelize.define(
  'purchaseorder',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    poDescription: {
      field: 'po_description',
      type: DataTypes.STRING,
      allowNull: true,
    },
    poAmount: {
      field: 'po_amount',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    poNumber: {
      field: 'po_number',
      type: DataTypes.STRING,
      allowNull: true,
    },
    poPrice: {
      field: 'po_price',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    poForecast: {
      field: 'po_forecast',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    poDate: {
      field: 'po_date',
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    poEndDate: {
      field: 'po_end_date',
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    cluster: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Other',
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
    poStatus: {
      field: 'po_status',
      type: DataTypes.ENUM('open', 'pending', 'closed', 'canceled'),
      defaultValue: 'pending',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'active',
      defaultValue: true,
    },
    currencyCode: {
      field: 'currency_code',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'EUR',
    },
    poMissionId: {
      field: 'po_mission_id',
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  { timestamps: false }
);

//Sync the model with the database
PurchaseOrder.belongsTo(MissionCard, { foreignKey: 'poMissionId', as: 'projectPo' });
MissionCard.hasMany(PurchaseOrder, { foreignKey: 'poMissionId', as: 'projectPo' });

module.exports = PurchaseOrder;
