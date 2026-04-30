'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserTeams', {
      profile_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: { model: 'Profiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      team_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: { model: 'teams', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      occupancy: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UserTeams');
  },
};
