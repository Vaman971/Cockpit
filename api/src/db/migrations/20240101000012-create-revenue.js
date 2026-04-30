'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('revenues', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      revenue_description: { type: Sequelize.STRING, allowNull: true },
      planned_revenue: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      actual_revenue: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      forecast_revenue: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      saving: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      cluster: { type: Sequelize.STRING, allowNull: true, defaultValue: 'Other' },
      extension: { type: Sequelize.ENUM('extended', 'not extended'), defaultValue: 'not extended', allowNull: true },
      siglum: { type: Sequelize.STRING, allowNull: true },
      region: { type: Sequelize.STRING, allowNull: true, defaultValue: 'NA' },
      revenue_mission_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: 'missionCards', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATEONLY, allowNull: true },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('revenues'); },
};
