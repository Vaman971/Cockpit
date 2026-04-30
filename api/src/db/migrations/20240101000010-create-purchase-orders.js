'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchaseorders', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      po_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      po_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      po_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      po_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      po_forecast: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      po_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      po_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      cluster: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Other',
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'NA',
      },
      siglum: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      po_status: {
        type: Sequelize.ENUM('open', 'pending', 'closed', 'canceled'),
        defaultValue: 'pending',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      currency_code: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'EUR',
      },
      po_mission_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'missionCards', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('purchaseorders');
  },
};
