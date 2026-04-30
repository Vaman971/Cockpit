const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createSaving,
  updateSavingsById,
  getSavings,
  getSavingsById,
  getSavingsByRevenueId,
  deleteSavingById,
} = require('../controllers/savingsController');

const router = express.Router();

router.post('/createSavings/:revenueId', verifyToken, verifyAuth, createSaving);
router.get('/getSavings', verifyToken, verifyAuth, getSavings);
router.get('/getSavings/:id', verifyToken, verifyAuth, getSavingsById);
router.get('/getSavingsByRevenueId/:id', verifyToken, verifyAuth, getSavingsByRevenueId);
router.put('/updateSavings/:id', verifyToken, verifyAuth, updateSavingsById);
router.delete('/deleteSavings/:id', verifyToken, verifyAuth, deleteSavingById); // New route for deleting an invoice

module.exports = router;
