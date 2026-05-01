const { DataTypes } = require('sequelize');
const ExtentionModel = require('./extentionModel');
const sequelize = require('../db/connection');

const ExtentionInvoice = sequelize.define(
  'extentioninvoice',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'id',
    },
    invoiceDate: {
      field: 'invoice_date',
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    revenueProjection: {
      field: 'revenue_projection',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    actualRevenue: {
      field: 'actual_revenue',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    currencyCode: {
      field: 'currency_code',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'EUR',
    },
    extentionId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'extention_id',
    },
  },
  {
    timestamps: false,
  }
);

ExtentionInvoice.belongsTo(ExtentionModel, { foreignKey: 'extentionId', as: 'invoiceExtention' });
ExtentionModel.hasMany(ExtentionInvoice, { foreignKey: 'extentionId', as: 'invoiceExtention' });

module.exports = ExtentionInvoice;
