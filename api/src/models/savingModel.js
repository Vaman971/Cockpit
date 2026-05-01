const { DataTypes } = require('sequelize');
const RevenueModel = require('./revenueModel');
const sequelize = require('../db/connection');

const savingModel = sequelize.define(
  'saving',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'id',
    },
    savingDate: {
      field: 'saving_date',
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    savingAmount: {
      field: 'saving_amount',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    revenueId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'revenue_id',
    },
  },
  {
    timestamps: false,
  }
);
savingModel.belongsTo(RevenueModel, { foreignKey: 'revenueId', as: 'savingRevenue' });
RevenueModel.hasMany(savingModel, { foreignKey: 'revenueId', as: 'savingRevenue' });

module.exports = savingModel;
