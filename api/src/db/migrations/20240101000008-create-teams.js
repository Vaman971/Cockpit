'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teams', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      team_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cluster: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Other',
      },
      mission_card_team_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'missionCards', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('teams');
  },
};
