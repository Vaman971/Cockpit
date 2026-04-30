/**
 * Extension routes (canonical — new spelling).
 * Old routes at /extention are kept as deprecated aliases in index.js.
 */
const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createExtension,
  updateExtension,
  getExtensions,
  getExtensionById,
  getExtensionInvoices,
} = require('../controllers/extensionController');

const router = express.Router();

router.post('/createExtension', verifyToken, verifyAuth, createExtension);
router.get('/getExtensions', verifyToken, verifyAuth, getExtensions);
router.get('/getExtension/:id', verifyToken, verifyAuth, getExtensionById);
router.put('/updateExtension/:id', verifyToken, verifyAuth, updateExtension);
router.get('/getExtensionInvoices/:id', verifyToken, verifyAuth, getExtensionInvoices);

module.exports = router;
