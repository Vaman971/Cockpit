/**
 * ExtensionInvoice model — JS renamed from 'extentionInvoice' to 'extensionInvoice'.
 * DB table name 'extentioninvoice' and column names preserved for backward compatibility.
 */
const { DataTypes } = require('sequelize');
const ExtensionModel = require('./extensionModel');
const sequelize = require('../db/connection');

const ExtensionInvoice = sequelize.define(
  'extentioninvoice',
  {
    // table name kept for DB compat
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
    extensionId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'extention_id', // DB column kept for compat
    },
  },
  { timestamps: false }
);

ExtensionInvoice.belongsTo(ExtensionModel, { foreignKey: 'extensionId', as: 'invoiceExtension' });
ExtensionModel.hasMany(ExtensionInvoice, { foreignKey: 'extensionId', as: 'extensionInvoices' });

module.exports = ExtensionInvoice;
