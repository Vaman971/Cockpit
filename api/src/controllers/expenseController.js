const Expense = require('../models/expenseModel');

const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(200).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error retrieving expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error('Error retrieving expense by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLatestExpense = async (req, res) => {
  try {
    const expenseList = await Expense.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
    });
    res.json(expenseList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense = await Expense.update(req.body, {
      where: { id },
    });
    if (updatedExpense[0] === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    const expense = await Expense.findByPk(id);
    res.status(200).json(expense);
  } catch (error) {
    console.error('Error updating expense by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpenseById,
  getLatestExpense,
};
