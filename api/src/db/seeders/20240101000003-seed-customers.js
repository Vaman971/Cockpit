'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Customers', [
      {
        first_name: 'Sample',
        last_name: 'Customer',
        siglum: 'SMPL',
        site: 'Toulouse',
        email: 'sample.customer@airbus.com',
        phone: '+33-555-0100',
        contactpoint: 'N/A',
        created_on: new Date(),
        updated_on: new Date(),
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Customers', { email: 'sample.customer@airbus.com' }, {});
  },
};
