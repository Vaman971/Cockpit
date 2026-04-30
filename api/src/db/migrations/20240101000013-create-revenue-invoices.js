'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('revenueinvoices', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      invoice_date: { type: Sequelize.DATEONLY, allowNull: true },
      planned_revenue: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      actual_revenue: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      forecast_revenue: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      revenue_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: 'revenues', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      status: { type: Sequelize.ENUM('auto', 'manual'), allowNull: false, defaultValue: 'auto' },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('revenueinvoices'); },
};
