'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('currencyModels', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
      currency_code: { type: Sequelize.STRING, allowNull: false },
      country_name: { type: Sequelize.STRING, allowNull: false },
      conversion_rate: { type: Sequelize.FLOAT, allowNull: false },
      conversion_year: { type: Sequelize.INTEGER, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('currencyModels'); },
};
