'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('currencyModels', [
      { currency_code: 'EUR', country_name: 'European Union', conversion_rate: 1.00, conversion_year: 2024 },
      { currency_code: 'USD', country_name: 'United States', conversion_rate: 1.08, conversion_year: 2024 },
      { currency_code: 'GBP', country_name: 'United Kingdom', conversion_rate: 0.86, conversion_year: 2024 },
      { currency_code: 'INR', country_name: 'India', conversion_rate: 90.12, conversion_year: 2024 },
      { currency_code: 'AED', country_name: 'United Arab Emirates', conversion_rate: 3.97, conversion_year: 2024 },
      { currency_code: 'JPY', country_name: 'Japan', conversion_rate: 163.45, conversion_year: 2024 },
      { currency_code: 'CAD', country_name: 'Canada', conversion_rate: 1.47, conversion_year: 2024 },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('currencyModels', null, {});
  },
};
