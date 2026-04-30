const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createExtentionInvoice,
  getExtentionInvoices,
  getExtentionInvoiceById,
  getExtentionInvoicesByExtentionId,
  updateExtentionInvoiceById,
  deleteExtentionInvoiceById,
} = require('../controllers/extentionInvoiceController');

const router = express.Router();

router.post(
  '/createExtentionInvoice/:extentionId',
  verifyToken,
  verifyAuth,
  createExtentionInvoice
);
router.get('/getExtentionInvoices', verifyToken, verifyAuth, getExtentionInvoices);
router.get('/getExtentionInvoice/:id', verifyToken, verifyAuth, getExtentionInvoiceById);
router.get(
  '/getExtentionInvoicesByExtentionId/:id',
  verifyToken,
  verifyAuth,
  getExtentionInvoicesByExtentionId
);
router.put('/updateExtentionInvoice/:id', verifyToken, verifyAuth, updateExtentionInvoiceById);
router.delete('/deleteExtentionInvoice/:id', verifyToken, verifyAuth, deleteExtentionInvoiceById);

module.exports = router;
