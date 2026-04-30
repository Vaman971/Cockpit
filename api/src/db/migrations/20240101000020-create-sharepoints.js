'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sharePoints', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      url_link: { type: Sequelize.STRING, allowNull: true },
      doc_mission_id: {
        type: Sequelize.BIGINT, allowNull: true,
        references: { model: 'missionCards', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('sharePoints'); },
};
