const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createInvoice,
  getInvoice,
  getInvoiceById,
  getInvoicesByPoId,
  updateInvoiceById,
  createInvoiceByPoId,
  deleteInvoiceById,
} = require('../controllers/invoiceController');
const { validate } = require('../middleware/validate');
const schemas = require('../middleware/schemas');

const router = express.Router();

router.post(
  '/createInvoice',
  verifyToken,
  verifyAuth,
  validate(schemas.createInvoice),
  createInvoice
);
router.post('/createInvoiceByPoId/:poId', verifyToken, verifyAuth, createInvoiceByPoId);
router.get('/getInvoice', verifyToken, verifyAuth, getInvoice);
router.get('/getInvoice/:id', verifyToken, verifyAuth, getInvoiceById);
router.get('/getInvoiceByPoId/:id', verifyToken, verifyAuth, getInvoicesByPoId);
router.put(
  '/updateInvoice/:id',
  verifyToken,
  verifyAuth,
  validate(schemas.updateInvoice),
  updateInvoiceById
);
router.delete('/deleteInvoiceById/:id', verifyToken, verifyAuth, deleteInvoiceById);

module.exports = router;
