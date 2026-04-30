'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('extentions', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: true },
      revenue_projection: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      project_leader: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'Users', key: 'user_id' },
        onUpdate: 'SET NULL', onDelete: 'SET NULL',
      },
      currency_code: { type: Sequelize.STRING, allowNull: false, defaultValue: 'EUR' },
      actual_revenue: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      cluster: { type: Sequelize.STRING, allowNull: true, defaultValue: 'Other' },
      extention_start_date: { type: Sequelize.DATEONLY, allowNull: true },
      extention_end_date: { type: Sequelize.DATEONLY, allowNull: true },
      region: { type: Sequelize.STRING, allowNull: true, defaultValue: 'NA' },
      siglum: { type: Sequelize.STRING, allowNull: true },
      extention_project_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: 'projects', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      status: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATEONLY, allowNull: true },
      likeliness: { type: Sequelize.ENUM('High', 'Medium', 'Low'), defaultValue: 'Low', allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('extentions'); },
};
