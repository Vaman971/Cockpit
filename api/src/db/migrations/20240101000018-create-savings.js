'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('savings', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      saving_date: { type: Sequelize.DATEONLY, allowNull: true },
      saving_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      remark: { type: Sequelize.TEXT, allowNull: true },
      revenue_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: 'revenues', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('savings'); },
};
