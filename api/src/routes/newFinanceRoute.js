const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const { getRevenueData } = require('../controllers/newFinanceController');

const router = express.Router();

router.get('/getRevenueData', verifyToken, verifyAuth, getRevenueData);

module.exports = router;
