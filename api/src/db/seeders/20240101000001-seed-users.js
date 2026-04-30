'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hashedPassword = bcrypt.hashSync('Admin@Bluebird123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        username: 'adminUser',
        email: 'adminUser@tatatechnologies.com',
        password: hashedPassword,
        user_type: 'Admin',
        active: true,
        burden_rate: null,
        created_on: new Date(),
        updated_on: new Date(),
      },
      {
        username: 'leaderUser',
        email: 'leaderUser@tatatechnologies.com',
        password: bcrypt.hashSync('Leader@Bluebird123', 10),
        user_type: 'Leader',
        active: true,
        burden_rate: null,
        created_on: new Date(),
        updated_on: new Date(),
      },
      {
        username: 'readerUser',
        email: 'readerUser@tatatechnologies.com',
        password: bcrypt.hashSync('Reader@Bluebird123', 10),
        user_type: 'Reader',
        active: true,
        burden_rate: null,
        created_on: new Date(),
        updated_on: new Date(),
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', {
      email: [
        'adminUser@tatatechnologies.com',
        'leaderUser@tatatechnologies.com',
        'readerUser@tatatechnologies.com',
      ],
    }, {});
  },
};
