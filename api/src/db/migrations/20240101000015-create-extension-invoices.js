'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('extentioninvoices', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      invoice_date: { type: Sequelize.DATEONLY, allowNull: true },
      revenue_projection: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      actual_revenue: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      currency_code: { type: Sequelize.STRING, allowNull: false, defaultValue: 'EUR' },
      extention_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: 'extentions', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('extentioninvoices'); },
};
