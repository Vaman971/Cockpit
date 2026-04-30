const express = require('express');
const {
  createCurrency,
  getCurrencyConversionRate,
  bulkCreateCurrencies,
  updateCurrency,
  getCurrencies,
  getCurrencyById,
  deleteCurrency,
  convertCurrency,
} = require('../controllers/currencyController');

const router = express.Router();

// Route for currency conversion between two currencies
router.get('/convert', convertCurrency);

// Route for currency conversion rates
router.get('/conversion', getCurrencyConversionRate);

// Route to add a new currency conversion rate
router.post('/create', createCurrency);

// Route to add a new currency in bulk
router.post('/bulkCreate', bulkCreateCurrencies);

// Route to update an existing currency conversion rate by ID
router.put('/update/:id', updateCurrency);

// Route to fetch all currency conversion rates
router.get('/getCurrency', getCurrencies);

// Route to fetch a single currency conversion rate by ID
router.get('/getCurrency/:id', getCurrencyById);

// Route to delete a specific currency conversion rate by ID
router.delete('/delete/:id', deleteCurrency);

module.exports = router;
