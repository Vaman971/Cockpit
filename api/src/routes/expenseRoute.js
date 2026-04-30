const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpenseById,
  getLatestExpense,
} = require('../controllers/expenseController');

const router = express.Router();

router.post('/createExpense', verifyToken, verifyAuth, createExpense);
router.get('/getExpenses', verifyToken, verifyAuth, getExpenses);
router.get('/getExpense/:id', verifyToken, verifyAuth, getExpenseById);
router.get('/getLatestExpense', verifyToken, verifyAuth, getLatestExpense);
router.put('/updateExpense/:id', verifyToken, verifyAuth, updateExpenseById);

module.exports = router;
