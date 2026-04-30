// controllers/currencyController.js
const CurrencyModel = require('../models/currencyModel');

// Function to get currency conversion rate from the database
const getCurrencyConversionRate = async (req, res) => {
  const { fromCurrency, toCurrency, year } = req.query;

  try {
    // Fetch the conversion rates for the given currencies and year
    const fromCurrencyData = await CurrencyModel.findOne({
      where: { currency_code: fromCurrency.toUpperCase(), conversion_year: year },
    });
    const toCurrencyData = await CurrencyModel.findOne({
      where: { currency_code: toCurrency.toUpperCase(), conversion_year: year },
    });

    // Check if both currencies exist in the database
    if (!fromCurrencyData || !toCurrencyData) {
      throw new Error('Currency not found for the specified year');
    }

    const conversionRate = (
      toCurrencyData.conversion_rate / fromCurrencyData.conversion_rate
    ).toFixed(2);

    // Return the conversion rates
    return res.status(200).json({
      toRate: conversionRate,
    });
  } catch (error) {
    console.error('Error fetching conversion rate from database:', error);
    res.status(500).json({ error: error.message });
  }
};

// Function to convert currency from one type to another
const convertCurrency = async (req, res) => {
  const { fromCurrency, toCurrency, amount, year } = req.query;

  try {
    // Fetch conversion rates for the given currencies
    const fromCurrencyData = await CurrencyModel.findOne({
      where: { currency_code: fromCurrency.toUpperCase(), conversion_year: year },
    });
    const toCurrencyData = await CurrencyModel.findOne({
      where: { currency_code: toCurrency.toUpperCase(), conversion_year: year },
    });

    if (!fromCurrencyData || !toCurrencyData) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }

    // Convert the amount to the base currency (USD, for example)
    const amountInUSD = amount / fromCurrencyData.conversion_rate;

    // Convert from USD to target currency
    const convertedAmount = amountInUSD * toCurrencyData.conversion_rate;

    return res.status(200).json({
      from: fromCurrency,
      to: toCurrency,
      amount,
      convertedAmount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error converting currency' });
  }
};

// Create a new currency entry
const createCurrency = async (req, res) => {
  try {
    const { currency_code, country_name, conversion_rate, conversion_year } = req.body;
    const newCurrency = await CurrencyModel.create({
      currency_code,
      country_name,
      conversion_rate,
      conversion_year,
    });
    res.status(201).json({ message: 'Currency created successfully', data: newCurrency });
  } catch (error) {
    console.error('Error creating currency:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const bulkCreateCurrencies = async (req, res) => {
  try {
    const currencyData = req.body; // Expecting an array of currency data

    // Using bulkCreate to insert multiple records at once
    const newCurrencies = await CurrencyModel.bulkCreate(currencyData, {
      validate: true, // Validates each entry based on the model schema
      ignoreDuplicates: true, // Ignores any duplicates based on the unique constraint
    });

    res.status(201).json({
      message: 'Currencies added successfully',
      data: newCurrencies,
    });
  } catch (error) {
    console.error('Error in bulk creation of currencies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an existing currency entry by ID
const updateCurrency = async (req, res) => {
  try {
    const currencyId = req.params.id;
    const { currency_code, country_name, conversion_rate, conversion_year } = req.body;

    const updatedCurrency = await CurrencyModel.update(
      { currency_code, country_name, conversion_rate, conversion_year },
      { where: { id: currencyId } }
    );

    if (updatedCurrency[0] === 0) {
      return res.status(404).json({ message: 'Currency not found' });
    }

    res.status(200).json({ message: 'Currency updated successfully' });
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all currency entries
const getCurrencies = async (req, res) => {
  try {
    const currencies = await CurrencyModel.findAll();
    res.status(200).json({ message: 'Currencies fetched successfully', data: currencies });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a currency entry by ID
const getCurrencyById = async (req, res) => {
  try {
    const currencyId = req.params.id;
    const currency = await CurrencyModel.findByPk(currencyId);

    if (!currency) {
      return res.status(404).json({ message: 'Currency not found' });
    }

    res.status(200).json({ message: 'Currency fetched successfully', data: currency });
  } catch (error) {
    console.error('Error fetching currency by ID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a currency entry by ID
const deleteCurrency = async (req, res) => {
  try {
    const currencyId = req.params.id;

    const deleted = await CurrencyModel.destroy({ where: { id: currencyId } });

    if (!deleted) {
      return res.status(404).json({ message: 'Currency not found' });
    }

    res.status(200).json({ message: 'Currency deleted successfully' });
  } catch (error) {
    console.error('Error deleting currency:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  convertCurrency,
  getCurrencyConversionRate,
  createCurrency,
  bulkCreateCurrencies,
  updateCurrency,
  getCurrencies,
  getCurrencyById,
  deleteCurrency,
};
