const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Expense = sequelize.define(
  'expense',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    expenseDescription: {
      field: 'expense_description',
      type: DataTypes.STRING,
      allowNull: true,
    },
    expenseType: {
      field: 'expense_type',
      type: DataTypes.ENUM('Salary', 'Trip', 'IT', 'Service', 'Other'),
      defaultValue: 'Other',
      allowNull: true,
    },
    expenseAmount: {
      field: 'expense_amount',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    expenseStatus: {
      field: 'expense_status',
      type: DataTypes.ENUM('Paid', 'Invalid', 'Unpaid'),
      defaultValue: 'Unpaid',
      allowNull: true,
    },
    expenseDate: {
      field: 'expense_date',
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

//Sync the model with the database
module.exports = Expense;
