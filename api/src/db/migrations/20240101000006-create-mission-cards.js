'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('missionCards', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      airbus_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      mission_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      mission_card_leader: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'user_id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      },
      mission_card_duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      mission_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      mission_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      proj_mission_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'projects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      mission_card_team: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Yet to Start', 'In Progress', 'Closed'),
        defaultValue: 'Yet to Start',
      },
      mission_type: {
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
      region: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'NA',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('missionCards');
  },
};
