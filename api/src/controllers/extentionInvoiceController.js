const { Op } = require('sequelize');
const ExtentionInvoice = require('../models/extentionInvoice');
const ExtentionModel = require('../models/extentionModel');
const logger = require('../utils/logger');

ExtentionInvoice.afterSave(async (invoice) => {
  const extentionId = invoice.extentionId;
  try {
    const [totalActualRevenue, totalRevenueProjection, extention] = await Promise.all([
      ExtentionInvoice.sum('actualRevenue', { where: { extentionId } }),
      ExtentionInvoice.sum('revenueProjection', { where: { extentionId } }),
      ExtentionModel.findByPk(extentionId),
    ]);
    if (extention) {
      await extention.update(
        { revenueProjection: totalRevenueProjection, actualRevenue: totalActualRevenue },
        { hooks: false }
      );
      await ExtentionInvoice.update(
        { currencyCode: extention.currencyCode },
        { where: { extentionId } }
      );
    }
  } catch (error) {
    logger.error('ExtentionInvoice afterSave hook error:', error);
  }
});

ExtentionInvoice.beforeDestroy(async (invoice) => {
  try {
    const extention = await ExtentionModel.findByPk(invoice.extentionId);
    if (extention) {
      await extention.update(
        {
          revenueProjection: Math.max(
            0,
            (extention.revenueProjection || 0) - (invoice.revenueProjection || 0)
          ),
          actualRevenue: Math.max(0, (extention.actualRevenue || 0) - (invoice.actualRevenue || 0)),
        },
        { hooks: false }
      );
    }
  } catch (error) {
    logger.error('ExtentionInvoice beforeDestroy hook error:', error);
  }
});

const createExtentionInvoice = async (req, res) => {
  try {
    const { extentionId } = req.params;
    const { revenueProjection, actualRevenue, invoiceDate } = req.body;

    if (revenueProjection === 0 && invoiceDate === '') {
      const responseInvoice = await ExtentionInvoice.create({
        extentionId,
        revenueProjection,
        invoiceDate: null,
      });

      res.status(200).json(responseInvoice);
    } else {
      const parsedInvoiceDate = new Date(invoiceDate);
      const invoiceMonth = parsedInvoiceDate.toISOString().slice(0, 7);

      const existingInvoice = await ExtentionInvoice.findOne({
        where: {
          extentionId,
          invoiceDate: {
            [Op.between]: [`${invoiceMonth}-01`, `${invoiceMonth}-30`],
          },
        },
      });

      if (existingInvoice) {
        // If an invoice exists for the same month and revenue, update its amount
        existingInvoice.actualRevenue =
          Number(existingInvoice.actualRevenue) + Number(actualRevenue);
        existingInvoice.revenueProjection =
          Number(existingInvoice.revenueProjection) + Number(revenueProjection);
        await existingInvoice.save();
        res.status(200).json(existingInvoice);
      } else {
        // If no invoice exists for the same month and revenue, create a new invoice
        const newInvoice = await ExtentionInvoice.create({
          extentionId,
          actualRevenue,
          revenueProjection,
          invoiceDate: parsedInvoiceDate,
        });
        res.status(200).json(newInvoice);
      }
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getExtentionInvoices = async (req, res) => {
  try {
    const invoices = await ExtentionInvoice.findAll({
      include: [{ model: ExtentionModel, as: 'invoiceExtention' }],
    });
    res.status(200).json(invoices);
  } catch (error) {
    logger.error('Error retrieving extention invoices:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExtentionInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await ExtentionInvoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'extention invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    logger.error('Error retrieving extention invoice by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExtentionInvoicesByExtentionId = async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await ExtentionInvoice.findAll({
      where: { extentionId: id },
      include: [{ model: ExtentionModel, as: 'invoiceExtention' }],
      order: [['invoice_date', 'DESC']],
    });
    if (!invoices || invoices.length === 0) {
      return res
        .status(404)
        .json({ error: 'No Extention invoices found for the specified revenue ID' });
    } else {
      res.status(200).json(invoices);
    }
  } catch (error) {
    logger.error('Error retrieving Extention invoices by revenue ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateExtentionInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { revenueProjection, actualRevenue, invoiceDate } = req.body;

    if (!revenueProjection && !actualRevenue && !invoiceDate) {
      return res.status(400).json({ error: 'No input from User' });
    }
    const invoice = await ExtentionInvoice.findByPk(id);
    if (invoiceDate) {
      const parsedInvoiceDate = new Date(invoiceDate);
      const invoiceMonth = parsedInvoiceDate.toISOString().slice(0, 7);

      const existingInvoice = await ExtentionInvoice.findOne({
        where: {
          id: {
            [Op.not]: id, // Exclude the invoice being updated
            extentionId: invoice.extentionId,
          },
          invoiceDate: {
            [Op.between]: [`${invoiceMonth}-01`, `${invoiceMonth}-30`],
          },
        },
      });

      if (existingInvoice) {
        // If an invoice exists for the same month and revenue, destroy it
        await existingInvoice.destroy();
      }
    }

    // Update the invoice being updated
    const updatedInvoice = await ExtentionInvoice.findByPk(id);

    if (!updatedInvoice) {
      res.status(404).json({ error: 'Extention invoice not found' });
    }

    updatedInvoice.revenueProjection =
      revenueProjection !== undefined ? revenueProjection : updatedInvoice.revenueProjection;
    updatedInvoice.actualRevenue =
      actualRevenue !== undefined ? actualRevenue : updatedInvoice.actualRevenue;
    updatedInvoice.invoiceDate =
      invoiceDate !== undefined ? new Date(invoiceDate) : updatedInvoice.invoiceDate;

    // Save the updated invoice
    await updatedInvoice.save();

    res.status(200).json(updatedInvoice);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteExtentionInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await ExtentionInvoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ error: 'Extention invoice not found' });
    }

    await invoice.destroy();
    res.status(200).json({ message: 'Extention invoice deleted successfully' });
  } catch (error) {
    logger.error('Error deleting Extention invoice:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createExtentionInvoice,
  getExtentionInvoices,
  getExtentionInvoiceById,
  updateExtentionInvoiceById,
  getExtentionInvoicesByExtentionId,
  deleteExtentionInvoiceById,
};
