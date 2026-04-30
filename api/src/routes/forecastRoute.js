const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createForecast,
  getForecasts,
  getForecastById,
  updateForecast,
  getLatestForecasts,
} = require('../controllers/forecastController');
const router = express.Router();

router.post('/create', verifyToken, verifyAuth, createForecast);
router.get('/getAll', verifyToken, verifyAuth, getForecasts);
router.get('/getForecast/:id', verifyToken, verifyAuth, getForecastById);
router.put('/update/:id', verifyToken, verifyAuth, updateForecast);
router.get('/getLatestForecast', verifyToken, verifyAuth, getLatestForecasts);

module.exports = router;
