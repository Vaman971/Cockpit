const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection'); // Assuming sequelize initialization is in a separate file

const Customer = sequelize.define(
  'Customer',
  {
    customer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    siglum: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    site: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactpoint: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_on: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    // Other model options
    timestamps: false, // Disable createdAt and updatedAt columns
    underscored: true, // Use snake_case for column names
  }
);

module.exports = Customer;
