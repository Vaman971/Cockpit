// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection'); // Assuming sequelize initialization is in a separate file

const User = sequelize.define(
  'User',
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'BLD@123',
    },
    burden_rate: {
      type: DataTypes.DECIMAL(10, 2),
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
    user_type: {
      type: DataTypes.ENUM,
      values: ['Leader', 'Reader', 'Admin'],
      defaultValue: 'Reader',
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    // Other model options
    timestamps: false, // Disable createdAt and updatedAt columns
    underscored: true, // Use snake_case for column names
  }
);
module.exports = User;
