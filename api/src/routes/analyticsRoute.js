const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  projectStatusCount,
  oppRegionCount,
  totalOpportunityCount,
  totalUserCount,
  totalProjectCount,
  oppCreatedLastWeek,
  oppWonLastWeek,
  oppQueryCount,
  getMissionCardCount,
  getLatestOpportunities,
  getExpensesAndInvoicesData,
  getPurchaseAmount,
  getTotalPurchase,
  getLatestPurchaseOrders,
  getPurchaseGraphAmounts,
  getPurchaseStats,
  getLatestExpenses,
  getLatestPoAndInvoiceData,
  getExpenseAmount,
  getLatestForecastsByDate,
  getForecastSum,
  getRevenueSum,
  getInvoiceSum,
  getMissionLeaderCount,
  getForecastAndRevenueData,
  getTotalRevenue,
  getPlannedData,
  getActualData,
  getDeliveryData,
  getSalesData,
  getforecastData,
  getOpportunityCountByCluster,
  getProjectWonCountByCluster,
  getCummulativeGraphData,
  getPoExcelData,
} = require('../controllers/analyticsController');
const router = express.Router();

router.get('/getOppByregionCount', verifyToken, oppRegionCount);
router.get('/getProjByStatusCount', verifyToken, projectStatusCount);
router.get('/gettotalOpportunityCount', verifyToken, totalOpportunityCount);
router.get('/getOppCountByCluster', verifyToken, getOpportunityCountByCluster);
router.get('/getProjectCountByCluster', verifyToken, getProjectWonCountByCluster);
router.get('/getOppCreatedLastWeek', verifyToken, oppCreatedLastWeek);
router.get('/gettotalUserCount', verifyToken, totalUserCount);
router.get('/gettotalProjectCount', verifyToken, totalProjectCount);
router.get('/getOppWonLastWeek', verifyToken, oppWonLastWeek);
router.get('/getOppQueryCount', verifyToken, oppQueryCount);
router.get('/getMissionCardCount', verifyToken, getMissionCardCount);
router.get('/getMissionLeaderCount', verifyToken, getMissionLeaderCount);
router.get('/getLatestOpportunities', verifyToken, getLatestOpportunities);
router.get('/getFinance', verifyToken, verifyAuth, getExpensesAndInvoicesData);
router.get('/getForecast', verifyToken, verifyAuth, getForecastAndRevenueData);
router.get('/getTotalPurchase', verifyToken, verifyAuth, getTotalPurchase);
router.get('/getExpenseAmount', verifyToken, verifyAuth, getExpenseAmount);
router.get('/getPurchaseAmount', verifyToken, verifyAuth, getPurchaseAmount);
router.get('/getPurchaseAmountByMissionLeader', verifyToken, verifyAuth, getPurchaseGraphAmounts);
router.get('/getLatestPurchaseOrder', verifyToken, verifyAuth, getLatestPurchaseOrders);
router.get('/getPurchaseStats', verifyToken, verifyAuth, getPurchaseStats);
router.get('/getLatestExpense', verifyToken, verifyAuth, getLatestExpenses);
router.get('/getLatestPoAndInvoice', verifyToken, verifyAuth, getLatestPoAndInvoiceData);
router.get('/getLatestForecast', verifyToken, verifyAuth, getLatestForecastsByDate);
router.get('/getForecastSum', verifyToken, verifyAuth, getForecastSum);
router.get('/getRevenueSum', verifyToken, verifyAuth, getRevenueSum);
router.get('/getInvoiceSum', verifyToken, verifyAuth, getInvoiceSum);
router.get('/getRevenueByCategory', verifyToken, verifyAuth, getTotalRevenue);
router.get('/getPlannedData', verifyToken, verifyAuth, getPlannedData);
router.get('/getActaulData', verifyToken, verifyAuth, getActualData);
router.get('/getDeliveryData', verifyToken, verifyAuth, getDeliveryData);
router.get('/getSalesData', verifyToken, verifyAuth, getSalesData);
router.get('/getForecastData', verifyToken, verifyAuth, getforecastData);
router.get('/getCummulativeGraph', verifyToken, verifyAuth, getCummulativeGraphData);
router.get('/getPoExcelData', getPoExcelData);

module.exports = router;
