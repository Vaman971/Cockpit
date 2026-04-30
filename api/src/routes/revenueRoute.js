const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createRevenue,
  getRevenues,
  getRevenueById,
  updateRevenue,
  getLatestRevenues,
  getRevenueInvoices,
} = require('../controllers/revenueController');

const router = express.Router();

router.post('/createRevenue', verifyToken, verifyAuth, createRevenue);
router.get('/getRevenues', verifyToken, verifyAuth, getRevenues);
router.get('/getRevenue/:id', verifyToken, verifyAuth, getRevenueById);
router.put('/updateRevenue/:id', verifyToken, verifyAuth, updateRevenue);
router.get('/getLatestRevenues', verifyToken, verifyAuth, getLatestRevenues);
router.get('/getRevenueInvoices/:id', verifyToken, verifyAuth, getRevenueInvoices);

module.exports = router;
