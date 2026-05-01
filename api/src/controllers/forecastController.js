const ForecastModel = require('../models/forecastModel');
const logger = require('../utils/logger');

// Create a forecast
const createForecast = async (req, res) => {
  try {
    const forecastCreated = await ForecastModel.create(req.body);
    res.json(forecastCreated);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all forecasts
const getForecasts = async (req, res) => {
  try {
    const forecastList = await ForecastModel.findAll({
      order: [['forcast_date', 'DESC']], // Sorting by forecast date in descending order
    });
    res.json(forecastList);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get forecast by ID
const getForecastById = async (req, res) => {
  try {
    const { id } = req.params;
    const forecast = await ForecastModel.findByPk(id);
    if (!forecast) {
      return res.status(404).json({ error: 'Forecast not found' });
    }
    res.json(forecast);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a forecast
const updateForecast = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await ForecastModel.update(req.body, {
      where: { id },
    });
    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'No user Input' });
    }
    res.json({ success: true, message: 'Forecast updated successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get latest forecasts
const getLatestForecasts = async (req, res) => {
  try {
    const forecastList = await ForecastModel.findAll({
      limit: 5,
      order: [['updated_at', 'DESC']],
    });
    res.json(forecastList);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createForecast,
  getForecasts,
  getForecastById,
  updateForecast,
  getLatestForecasts,
};
