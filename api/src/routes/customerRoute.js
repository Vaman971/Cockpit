const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createCustomer,
  updatedCustomer,
  deleteCustomer,
  getCustomerByMissionId,
  getMissionByCustomerId,
  getCustomers,
} = require('../controllers/customerController');
const router = express.Router();

router.post('/createCustomer', verifyToken, verifyAuth, createCustomer);
router.put('/updateCustomer/:id', verifyToken, verifyAuth, updatedCustomer);
router.get('/getCustomerByMissionId/:id', verifyToken, verifyAuth, getCustomerByMissionId);
router.get('/getMissionByCustomerId/:id', verifyToken, verifyAuth, getMissionByCustomerId);
router.delete('/deleteCustomer/:id', verifyToken, verifyAuth, deleteCustomer);
router.get('/getAllCustomers', verifyToken, verifyAuth, getCustomers);

module.exports = router;
