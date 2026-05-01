/**
 * extensionInvoiceController — renamed from extentionInvoiceController.
 */
const { Op } = require('sequelize');
const ExtensionInvoice = require('../models/extensionInvoice');
const ExtensionModel = require('../models/extensionModel');
const logger = require('../utils/logger');

// ─── Hooks ───────────────────────────────────────────────────────────────────

ExtensionInvoice.afterSave(async (invoice) => {
  const extensionId = invoice.extensionId;
  try {
    const [totalActualRevenue, totalRevenueProjection, extension] = await Promise.all([
      ExtensionInvoice.sum('actualRevenue', { where: { extensionId } }),
      ExtensionInvoice.sum('revenueProjection', { where: { extensionId } }),
      ExtensionModel.findByPk(extensionId),
    ]);
    if (extension) {
      await extension.update(
        { revenueProjection: totalRevenueProjection, actualRevenue: totalActualRevenue },
        { hooks: false }
      );
      await ExtensionInvoice.update(
        { currencyCode: extension.currencyCode },
        { where: { extensionId } }
      );
    }
  } catch (error) {
    logger.error('ExtensionInvoice afterSave hook error:', error);
  }
});

ExtensionInvoice.beforeDestroy(async (invoice) => {
  try {
    const extension = await ExtensionModel.findByPk(invoice.extensionId);
    if (extension) {
      await extension.update(
        {
          revenueProjection: Math.max(
            0,
            (extension.revenueProjection || 0) - (invoice.revenueProjection || 0)
          ),
          actualRevenue: Math.max(0, (extension.actualRevenue || 0) - (invoice.actualRevenue || 0)),
        },
        { hooks: false }
      );
    }
  } catch (error) {
    logger.error('ExtensionInvoice beforeDestroy hook error:', error);
  }
});

// ─── Controllers ─────────────────────────────────────────────────────────────

const createExtensionInvoice = async (req, res, next) => {
  try {
    const { extensionId } = req.params;
    const { revenueProjection, actualRevenue, invoiceDate } = req.body;

    // Handle zero-value placeholder invoice
    if (revenueProjection === 0 && invoiceDate === '') {
      const invoice = await ExtensionInvoice.create({
        extensionId,
        revenueProjection,
        invoiceDate: null,
      });
      return res.status(201).json({ success: true, invoice });
    }

    const parsedDate = new Date(invoiceDate);
    const invoiceMonth = parsedDate.toISOString().slice(0, 7);

    const existing = await ExtensionInvoice.findOne({
      where: {
        extensionId,
        invoiceDate: { [Op.between]: [`${invoiceMonth}-01`, `${invoiceMonth}-30`] },
      },
    });

    if (existing) {
      existing.actualRevenue = Number(existing.actualRevenue) + Number(actualRevenue);
      existing.revenueProjection = Number(existing.revenueProjection) + Number(revenueProjection);
      await existing.save();
      return res.status(200).json({ success: true, invoice: existing });
    }

    const invoice = await ExtensionInvoice.create({
      extensionId,
      actualRevenue,
      revenueProjection,
      invoiceDate: parsedDate,
    });
    return res.status(201).json({ success: true, invoice });
  } catch (error) {
    logger.error('createExtensionInvoice error:', error);
    next(error);
  }
};

const getExtensionInvoices = async (req, res, next) => {
  try {
    const invoices = await ExtensionInvoice.findAll({
      include: [{ model: ExtensionModel, as: 'invoiceExtension' }],
    });
    return res.status(200).json({ success: true, invoices });
  } catch (error) {
    logger.error('getExtensionInvoices error:', error);
    next(error);
  }
};

const getExtensionInvoiceById = async (req, res, next) => {
  try {
    const invoice = await ExtensionInvoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Extension invoice not found.' });
    }
    return res.status(200).json({ success: true, invoice });
  } catch (error) {
    logger.error('getExtensionInvoiceById error:', error);
    next(error);
  }
};

const getExtensionInvoicesByExtensionId = async (req, res, next) => {
  try {
    const invoices = await ExtensionInvoice.findAll({
      where: { extensionId: req.params.id },
      include: [{ model: ExtensionModel, as: 'invoiceExtension' }],
      order: [['invoice_date', 'DESC']],
    });
    if (!invoices || invoices.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'No invoices found for this extension.' });
    }
    return res.status(200).json({ success: true, invoices });
  } catch (error) {
    logger.error('getExtensionInvoicesByExtensionId error:', error);
    next(error);
  }
};

const updateExtensionInvoiceById = async (req, res, next) => {
  try {
    const { revenueProjection, actualRevenue, invoiceDate } = req.body;
    if (!revenueProjection && !actualRevenue && !invoiceDate) {
      return res.status(400).json({ success: false, error: 'At least one field is required.' });
    }

    const invoice = await ExtensionInvoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Extension invoice not found.' });
    }

    if (invoiceDate) {
      const parsedDate = new Date(invoiceDate);
      const invoiceMonth = parsedDate.toISOString().slice(0, 7);
      const existing = await ExtensionInvoice.findOne({
        where: {
          id: { [Op.not]: req.params.id },
          extensionId: invoice.extensionId,
          invoiceDate: { [Op.between]: [`${invoiceMonth}-01`, `${invoiceMonth}-30`] },
        },
      });
      if (existing) {
        await existing.destroy();
      }
      invoice.invoiceDate = parsedDate;
    }

    invoice.revenueProjection =
      revenueProjection !== undefined ? revenueProjection : invoice.revenueProjection;
    invoice.actualRevenue = actualRevenue !== undefined ? actualRevenue : invoice.actualRevenue;
    await invoice.save();
    return res.status(200).json({ success: true, invoice });
  } catch (error) {
    logger.error('updateExtensionInvoiceById error:', error);
    next(error);
  }
};

const deleteExtensionInvoiceById = async (req, res, next) => {
  try {
    const invoice = await ExtensionInvoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Extension invoice not found.' });
    }
    await invoice.destroy();
    return res.status(200).json({ success: true, message: 'Extension invoice deleted.' });
  } catch (error) {
    logger.error('deleteExtensionInvoiceById error:', error);
    next(error);
  }
};

module.exports = {
  createExtensionInvoice,
  getExtensionInvoices,
  getExtensionInvoiceById,
  getExtensionInvoicesByExtensionId,
  updateExtensionInvoiceById,
  deleteExtensionInvoiceById,
};
