'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('missionCardCustomers', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      mission_card_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'missionCards', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Customers', key: 'customer_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('missionCardCustomers');
  },
};
