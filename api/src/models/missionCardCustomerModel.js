// models/missionCardCustomerModel.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const MissionCard = require('./missionModel');
const Customers = require('./customerModel');

const MissionCardCustomer = sequelize.define(
  'missionCardCustomer',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    missionCardId: {
      field: 'mission_card_id',
      type: DataTypes.BIGINT,
      references: {
        model: MissionCard,
        key: 'id',
      },
    },
    customerId: {
      field: 'customer_id',
      type: DataTypes.INTEGER,
      references: {
        model: Customers,
        key: 'customer_id', // Assuming the customer's primary key is 'id'
      },
    },
  },
  {
    timestamps: false, // You typically don't need timestamps on a simple join table
  }
);

module.exports = MissionCardCustomer;
