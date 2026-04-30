const { DataTypes } = require('sequelize');
const RevenueModel = require('./revenueModel');
const sequelize = require('../db/connection');

const revenueInvoiceModel = sequelize.define(
  'revenueinvoice',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'id',
    },
    invoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'invoice_date',
      defaultValue: null,
    },
    plannedRevenue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'planned_revenue',
      defaultValue: null,
    },
    actualRevenue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'actual_revenue',
      defaultValue: null,
    },
    forecastRevenue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'forecast_revenue',
      defaultValue: null,
    },
    revenueId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'revenue_id',
    },
    status: {
      type: DataTypes.ENUM('auto', 'manual'),
      allowNull: false,
      defaultValue: 'auto',
    },
  },
  {
    timestamps: false,
  }
);

revenueInvoiceModel.belongsTo(RevenueModel, { foreignKey: 'revenueId', as: 'invoiceRevenue' });
RevenueModel.hasMany(revenueInvoiceModel, { foreignKey: 'revenueId', as: 'invoiceRevenue' });

module.exports = revenueInvoiceModel;
