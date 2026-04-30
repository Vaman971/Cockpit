const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const CurrencyModel = sequelize.define(
  'currencyModel',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
      allowNull: false,
    },
    currency_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    conversion_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    conversion_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = CurrencyModel;
