const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const ForecastModel = sequelize.define(
  'forcast',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    forcastDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryForcast: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    salesForcast: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    forcastDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dpValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cluster: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    revenueForcast: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    currencyCode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
  },
  {
    timestamps: false,
    hooks: {
      beforeCreate: (forecast) => {
        if (forecast.revenueForcast !== undefined) {
          forecast.updatedAt = new Date();
        }
      },
      beforeUpdate: (forecast) => {
        if (forecast.changed('revenueForcast')) {
          forecast.updatedAt = new Date();
        }
      },
    },
  }
);

//Sync the model with the database
module.exports = ForecastModel;
