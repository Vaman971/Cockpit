/**
 * Extension Invoice routes (canonical — new spelling).
 * Old routes at /extentionInvoice are kept as deprecated aliases in index.js.
 */
const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createExtensionInvoice,
  getExtensionInvoices,
  getExtensionInvoiceById,
  getExtensionInvoicesByExtensionId,
  updateExtensionInvoiceById,
  deleteExtensionInvoiceById,
} = require('../controllers/extensionInvoiceController');

const router = express.Router();

router.post(
  '/createExtensionInvoice/:extensionId',
  verifyToken,
  verifyAuth,
  createExtensionInvoice
);
router.get('/getExtensionInvoices', verifyToken, verifyAuth, getExtensionInvoices);
router.get('/getExtensionInvoice/:id', verifyToken, verifyAuth, getExtensionInvoiceById);
router.get(
  '/getExtensionInvoicesByExtensionId/:id',
  verifyToken,
  verifyAuth,
  getExtensionInvoicesByExtensionId
);
router.put('/updateExtensionInvoice/:id', verifyToken, verifyAuth, updateExtensionInvoiceById);
router.delete('/deleteExtensionInvoice/:id', verifyToken, verifyAuth, deleteExtensionInvoiceById);

module.exports = router;
