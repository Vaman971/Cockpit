const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  getPurchaseInfo,
  getDeliveryInfo,
  getforecastInfo,
  getRevenueProjectionInfo,
  getRevenueRecognizedInfo,
  getRevenueRecognizedPieChart,
  getForecastAndExtensionData,
  getPoAndInvoiceData,
  getPurchaseOrderPieChart,
  getPurchaseByMissionLeaderGraph,
  getLatestPurchaseOrderProgress,
} = require('../controllers/financeController');
const router = express.Router();

router.get('/getPurchaseInfo', verifyToken, verifyAuth, getPurchaseInfo);
router.get('/getDeliveryInfo', verifyToken, verifyAuth, getDeliveryInfo);
router.get('/getForecastInfo', verifyToken, verifyAuth, getforecastInfo);
router.get('/getRevenueProjectionInfo', verifyToken, verifyAuth, getRevenueProjectionInfo);
router.get('/getRevenueRecognizedInfo', verifyToken, verifyAuth, getRevenueRecognizedInfo);
router.get('/getRevenueRecognizedPieChart', verifyToken, verifyAuth, getRevenueRecognizedPieChart);
router.get('/getRevenueAndExtensionData', verifyToken, getForecastAndExtensionData);
router.get('/getPoAndInvoiceData', verifyToken, verifyAuth, getPoAndInvoiceData);
router.get('/getPoPie', verifyToken, verifyAuth, getPurchaseOrderPieChart);
router.get('/getPoByMissionLeader', verifyToken, verifyAuth, getPurchaseByMissionLeaderGraph);
router.get('/getPoProgress', verifyToken, verifyAuth, getLatestPurchaseOrderProgress);

module.exports = router;
