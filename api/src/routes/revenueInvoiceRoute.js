const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createRevenueInvoice,
  getRevenueInvoices,
  getRevenueInvoiceById,
  getRevenueInvoicesByRevenueId,
  updateRevenueInvoiceById,
  deleteRevenueInvoiceById,
} = require('../controllers/revenueInvoiceController');

const router = express.Router();

router.post('/createRevenueInvoice/:revenueId', verifyToken, verifyAuth, createRevenueInvoice);
router.get('/getRevenueInvoices', verifyToken, verifyAuth, getRevenueInvoices);
router.get('/getRevenueInvoice/:id', verifyToken, verifyAuth, getRevenueInvoiceById);
router.get(
  '/getRevenueInvoicesByRevenueId/:id',
  verifyToken,
  verifyAuth,
  getRevenueInvoicesByRevenueId
);
router.put('/updateRevenueInvoice/:id', verifyToken, verifyAuth, updateRevenueInvoiceById);
router.delete('/deleteRevenueInvoice/:id', verifyToken, verifyAuth, deleteRevenueInvoiceById); // New route for deleting an invoice

module.exports = router;
