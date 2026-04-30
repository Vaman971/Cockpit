'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('forcasts', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      forcast_description: { type: Sequelize.STRING, allowNull: true },
      delivery_forcast: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      sales_forcast: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      forcast_date: { type: Sequelize.DATEONLY, allowNull: true },
      dp_value: { type: Sequelize.STRING, allowNull: true },
      remark: { type: Sequelize.STRING, allowNull: true },
      region: { type: Sequelize.STRING, allowNull: true },
      cluster: { type: Sequelize.STRING, allowNull: true },
      revenue_forcast: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      updated_at: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      currency_code: { type: Sequelize.STRING, allowNull: false, defaultValue: 'USD' },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('forcasts'); },
};
