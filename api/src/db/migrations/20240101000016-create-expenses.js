'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      expense_description: { type: Sequelize.STRING, allowNull: true },
      expense_type: { type: Sequelize.ENUM('Salary', 'Trip', 'IT', 'Service', 'Other'), defaultValue: 'Other', allowNull: true },
      expense_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      expense_status: { type: Sequelize.ENUM('Paid', 'Invalid', 'Unpaid'), defaultValue: 'Unpaid', allowNull: true },
      expense_date: { type: Sequelize.DATE, allowNull: true },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('expenses'); },
};
