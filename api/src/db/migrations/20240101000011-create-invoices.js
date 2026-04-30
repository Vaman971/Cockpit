'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      invoice_date: { type: Sequelize.DATEONLY, allowNull: true },
      invoice_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      forecast_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      status: {
        type: Sequelize.ENUM('Paid', 'Unpaid'),
        defaultValue: 'Unpaid',
        allowNull: true,
      },
      currency_code: { type: Sequelize.STRING, allowNull: false, defaultValue: 'EUR' },
      po_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'purchaseorders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('invoices');
  },
};
