const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createExtention,
  updateExtention,
  getExtention,
  getExtentionById,
  getExtentionInvoices,
} = require('../controllers/extentionController');

const router = express.Router();

router.post('/createExtention', verifyToken, verifyAuth, createExtention);
router.get('/getExtention', verifyToken, verifyAuth, getExtention);
router.get('/getExtention/:id', verifyToken, verifyAuth, getExtentionById);
router.put('/updateExtention/:id', verifyToken, verifyAuth, updateExtention);
router.get('/getExtentionInvoices/:id', verifyToken, verifyAuth, getExtentionInvoices);

module.exports = router;
