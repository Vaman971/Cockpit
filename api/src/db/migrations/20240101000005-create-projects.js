'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'NA',
      },
      project_title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      project_lead: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'user_id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      },
      oppurtunity_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'oppurtunities', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      project_type: {
        type: Sequelize.ENUM('External', 'Internal'),
        defaultValue: 'External',
      },
      cluster: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Other',
      },
      siglum: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projects');
  },
};
