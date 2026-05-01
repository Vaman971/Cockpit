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
      field: 'forcast_description',
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryForcast: {
      field: 'delivery_forcast',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    salesForcast: {
      field: 'sales_forcast',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    forcastDate: {
      field: 'forcast_date',
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dpValue: {
      field: 'dp_value',
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
      field: 'revenue_forcast',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    currencyCode: {
      field: 'currency_code',
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
