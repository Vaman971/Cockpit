'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contact_details: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profile_image: {
        type: Sequelize.BLOB('long'),
        allowNull: true,
      },
      contact_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_profile_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      burden_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      total_occupancy: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Profiles');
  },
};
