const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Expense = sequelize.define('expense', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  expenseDescription: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expenseType: {
    type: DataTypes.ENUM('Salary', 'Trip', 'IT', 'Service', 'Other'),
    defaultValue: 'Other',
    allowNull: true,
  },
  expenseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  expenseStatus: {
    type: DataTypes.ENUM('Paid', 'Invalid', 'Unpaid'),
    defaultValue: 'Unpaid',
    allowNull: true,
  },
  expenseDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

//Sync the model with the database
module.exports = Expense;
