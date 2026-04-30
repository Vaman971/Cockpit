'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('oppurtunities', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      op_region: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      op_unit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      op_description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      associated_w_p: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customer_contact_point: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      siglum: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      program: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      priority: {
        type: Sequelize.ENUM('High', 'Medium', 'Low', 'NA'),
        defaultValue: 'Low',
        allowNull: true,
      },
      opportunity_type: {
        type: Sequelize.ENUM('External', 'Internal'),
        defaultValue: 'External',
      },
      confidence: {
        type: Sequelize.ENUM('High', 'Medium', 'Low', 'NA'),
        defaultValue: 'High',
        allowNull: true,
      },
      first_contact_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      latest_contact_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      next_contact_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Prospection', 'Advanced', 'Proposal', 'Won', 'Lost', 'Hold'),
        defaultValue: 'Prospection',
        allowNull: true,
      },
      source: {
        type: Sequelize.ENUM('Sales', 'New MC', 'Old MC', 'Workshop', 'Customer Contact'),
        defaultValue: 'Sales',
        allowNull: true,
      },
      expected_deal_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      expected_team_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      cluster: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Other',
      },
      led_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'user_id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      },
      supported_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'user_id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      marked_opp: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      mission_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      mission_end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      comments: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency_code: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'EUR',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('oppurtunities');
  },
};
