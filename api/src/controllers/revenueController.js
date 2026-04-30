const RevenueModel = require('../models/revenueModel');
const RevenueInvoiceModel = require('../models/revenueInvoiceModel');
const logger = require('../utils/logger');

const createRevenue = async (req, res, next) => {
  try {
    const revenue = await RevenueModel.create(req.body);
    return res.status(201).json({ success: true, revenue });
  } catch (error) {
    logger.error('createRevenue error:', error);
    next(error);
  }
};

const getRevenues = async (req, res, next) => {
  try {
    const revenues = await RevenueModel.findAll();
    return res.status(200).json({ success: true, revenues });
  } catch (error) {
    logger.error('getRevenues error:', error);
    next(error);
  }
};

const getRevenueById = async (req, res, next) => {
  try {
    const revenue = await RevenueModel.findByPk(req.params.id);
    if (!revenue) {
      return res.status(404).json({ success: false, error: 'Revenue not found.' });
    }
    return res.status(200).json({ success: true, revenue });
  } catch (error) {
    logger.error('getRevenueById error:', error);
    next(error);
  }
};

const updateRevenue = async (req, res, next) => {
  try {
    const [rowsUpdated] = await RevenueModel.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });
    if (rowsUpdated === 0) {
      return res.status(404).json({ success: false, error: 'Revenue not found.' });
    }
    return res.status(200).json({ success: true, message: 'Revenue updated successfully.' });
  } catch (error) {
    logger.error('updateRevenue error:', error);
    next(error);
  }
};

const getLatestRevenues = async (req, res, next) => {
  try {
    const revenues = await RevenueModel.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ success: true, revenues });
  } catch (error) {
    logger.error('getLatestRevenues error:', error);
    next(error);
  }
};

const getRevenueInvoices = async (req, res, next) => {
  try {
    const invoices = await RevenueInvoiceModel.findAll({ where: { revenueId: req.params.id } });
    return res.status(200).json({ success: true, invoices });
  } catch (error) {
    logger.error('getRevenueInvoices error:', error);
    next(error);
  }
};

module.exports = {
  createRevenue,
  getRevenues,
  getRevenueById,
  updateRevenue,
  getLatestRevenues,
  getRevenueInvoices,
};
