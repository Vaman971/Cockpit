const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const PurchaseOrder = require('./poModel');

const InvoiceModel = sequelize.define('invoice', {
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
  invoiceAmount: {
    type: DataTypes.DECIMAL(10, 2), // Assuming invoice amount is stored as a decimal with precision 10 and scale 2
    allowNull: true,
    field: 'invoice_amount',
    defaultValue: null,
  },
  forecastAmount: {
    type: DataTypes.DECIMAL(10, 2), // Assuming invoice amount is stored as a decimal with precision 10 and scale 2
    allowNull: true,
    field: 'forecast_amount',
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Unpaid'), // ENUM values should be defined within an array
    defaultValue: 'Unpaid',
    allowNull: true,
  },
  currencyCode: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'EUR',
  },
  poId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'po_id',
  },
});
InvoiceModel.belongsTo(PurchaseOrder, { foreignKey: 'poId', as: 'invoicePo' });
PurchaseOrder.hasMany(InvoiceModel, { foreignKey: 'poId', as: 'invoicePo' });

module.exports = InvoiceModel;
