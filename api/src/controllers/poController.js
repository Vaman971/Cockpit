const InvoiceModel = require('../models/invoiceModel');
const MissionCard = require('../models/missionModel');
const PurchaseOrder = require('../models/poModel');
const logger = require('../utils/logger');

// ─── Hook: propagate currency to child invoices ───────────────────────────────

PurchaseOrder.afterUpdate(async (purchaseOrder) => {
  try {
    const invoices = await InvoiceModel.findAll({ where: { poId: purchaseOrder.dataValues.id } });
    await Promise.all(
      invoices.map((invoice) =>
        invoice.update({ currencyCode: purchaseOrder.dataValues.currencyCode })
      )
    );
  } catch (error) {
    logger.error('PurchaseOrder afterUpdate hook error:', error);
  }
});

// ─── Controllers ─────────────────────────────────────────────────────────────

const createPo = async (req, res, next) => {
  try {
    const poCreated = await PurchaseOrder.create(req.body);
    return res.status(201).json({ success: true, purchaseOrder: poCreated });
  } catch (error) {
    logger.error('createPo error:', error);
    next(error);
  }
};

const getPo = async (req, res, next) => {
  try {
    const poList = await PurchaseOrder.findAll({
      include: [{ model: MissionCard, as: 'projectPo' }],
      order: [['po_date', 'DESC']],
    });
    return res.status(200).json({ success: true, purchaseOrders: poList });
  } catch (error) {
    logger.error('getPo error:', error);
    next(error);
  }
};

const getPoById = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id, {
      include: [{ model: MissionCard, as: 'projectPo' }],
    });
    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase order not found.' });
    }
    return res.status(200).json({ success: true, purchaseOrder: po });
  } catch (error) {
    logger.error('getPoById error:', error);
    next(error);
  }
};

const updatePo = async (req, res, next) => {
  try {
    const [updatedRowsCount] = await PurchaseOrder.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });
    if (updatedRowsCount === 0) {
      return res.status(404).json({ success: false, error: 'Purchase order not found.' });
    }
    return res.status(200).json({ success: true, message: 'Purchase order updated successfully.' });
  } catch (error) {
    logger.error('updatePo error:', error);
    next(error);
  }
};

const getLatestPo = async (req, res, next) => {
  try {
    const poList = await PurchaseOrder.findAll({
      include: [{ model: MissionCard, as: 'projectPo' }],
      limit: 5,
      order: [['po_date', 'DESC']],
    });
    return res.status(200).json({ success: true, purchaseOrders: poList });
  } catch (error) {
    logger.error('getLatestPo error:', error);
    next(error);
  }
};

module.exports = { createPo, getPo, getPoById, updatePo, getLatestPo };
