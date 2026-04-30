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
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    savingAmount: {
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
