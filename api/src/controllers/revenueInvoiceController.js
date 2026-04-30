const { Op } = require('sequelize');
const RevenueInvoiceModel = require('../models/revenueInvoiceModel');
const RevenueModel = require('../models/revenueModel');
const logger = require('../utils/logger');

RevenueInvoiceModel.afterSave(async (invoice) => {
  const revenueId = invoice.revenueId;
  try {
    const [totalForecastAmount, totalPlannedRevenue, totalActualRevenue, revenue] =
      await Promise.all([
        RevenueInvoiceModel.sum('forecast_revenue', { where: { revenueId } }),
        RevenueInvoiceModel.sum('planned_revenue', { where: { revenueId } }),
        RevenueInvoiceModel.sum('actual_revenue', { where: { revenueId } }),
        RevenueModel.findByPk(revenueId),
      ]);
    if (revenue) {
      await revenue.update(
        {
          forecastRevenue: totalForecastAmount,
          actualRevenue: totalActualRevenue,
          plannedRevenue: totalPlannedRevenue,
        },
        { hooks: false }
      );
    }
  } catch (error) {
    logger.error('RevenueInvoice afterSave hook error:', error);
  }
});

RevenueInvoiceModel.beforeDestroy(async (invoice) => {
  try {
    const revenue = await RevenueModel.findByPk(invoice.revenueId);
    if (revenue) {
      await revenue.update(
        {
          forecastRevenue: Math.max(
            0,
            (revenue.forecastRevenue || 0) - (invoice.forecastRevenue || 0)
          ),
          plannedRevenue: Math.max(
            0,
            (revenue.plannedRevenue || 0) - (invoice.plannedRevenue || 0)
          ),
          actualRevenue: Math.max(0, (revenue.actualRevenue || 0) - (invoice.actualRevenue || 0)),
        },
        { hooks: false }
      );
    }
  } catch (error) {
    logger.error('RevenueInvoice beforeDestroy hook error:', error);
  }
});

const createRevenueInvoice = async (req, res, next) => {
  try {
    const { revenueId } = req.params;
    const { forecastRevenue, actualRevenue, plannedRevenue, invoiceDate, status } = req.body;

    if (!invoiceDate) {
      return res.status(400).json({ error: 'invoiceDate is required' });
    }

    const parsedInvoiceDate = new Date(invoiceDate);
    const invoiceMonth = parsedInvoiceDate.toISOString().slice(0, 7);

    const existingInvoice = await RevenueInvoiceModel.findOne({
      where: {
        revenueId,
        invoiceDate: {
          [Op.between]: [`${invoiceMonth}-01`, `${invoiceMonth}-30`],
        },
      },
    });

    if (existingInvoice) {
      // If an invoice exists for the same month and revenue, update its amount
      existingInvoice.forecastRevenue =
        Number(existingInvoice.forecastRevenue) + Number(forecastRevenue);
      existingInvoice.actualRevenue = Number(existingInvoice.actualRevenue) + Number(actualRevenue);
      existingInvoice.plannedRevenue =
        Number(existingInvoice.plannedRevenue) + Number(plannedRevenue);
      existingInvoice.status = status;
      await existingInvoice.save();
      res.status(200).json(existingInvoice);
    } else {
      // If no invoice exists for the same month and revenue, create a new invoice
      const newInvoice = await RevenueInvoiceModel.create({
        revenueId,
        forecastRevenue,
        plannedRevenue,
        actualRevenue,
        status,
        invoiceDate: parsedInvoiceDate,
      });
      return res.status(201).json({ success: true, invoice: newInvoice });
    }
  } catch (error) {
    logger.error('createRevenueInvoice error:', error);
    next(error);
  }
};

const getRevenueInvoices = async (req, res) => {
  try {
    const invoices = await RevenueInvoiceModel.findAll({
      include: [{ model: RevenueModel, as: 'invoiceRevenue' }],
    });
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error retrieving revenue invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRevenueInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await RevenueInvoiceModel.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Revenue invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error retrieving revenue invoice by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRevenueInvoicesByRevenueId = async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await RevenueInvoiceModel.findAll({
      where: { revenueId: id },
      include: [{ model: RevenueModel, as: 'invoiceRevenue' }],
      order: [['invoice_date', 'DESC']],
    });
    if (!invoices || invoices.length === 0) {
      return res
        .status(404)
        .json({ error: 'No revenue invoices found for the specified revenue ID' });
    } else {
      res.status(200).json(invoices);
    }
  } catch (error) {
    console.error('Error retrieving revenue invoices by revenue ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRevenueInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { forecastRevenue, plannedRevenue, actualRevenue, invoiceDate, status } = req.body;

    if (!plannedRevenue && !actualRevenue && !invoiceDate && !status) {
      return res.status(400).json({ error: 'No input from User' });
    }

    const updatedInvoice = await RevenueInvoiceModel.findByPk(id);

    if (!updatedInvoice) {
      return res.status(404).json({ error: 'Revenue invoice not found' });
    }

    if (invoiceDate) {
      const parsedInvoiceDate = new Date(invoiceDate);
      const invoiceMonth = parsedInvoiceDate.toISOString().slice(0, 7);

      const existingInvoice = await RevenueInvoiceModel.findOne({
        where: {
          id: {
            [Op.not]: id, // Exclude the invoice being updated
          },
          revenueId: updatedInvoice.revenueId,
          invoiceDate: {
            [Op.between]: [`${invoiceMonth}-01`, `${invoiceMonth}-30`],
          },
        },
      });

      if (existingInvoice) {
        // If an invoice exists for the same month and revenue, destroy it
        await existingInvoice.destroy();
      }

      updatedInvoice.invoiceDate = parsedInvoiceDate;
    }

    updatedInvoice.forecastRevenue =
      forecastRevenue !== undefined ? forecastRevenue : updatedInvoice.forecastRevenue;
    updatedInvoice.plannedRevenue =
      plannedRevenue !== undefined ? plannedRevenue : updatedInvoice.plannedRevenue;
    updatedInvoice.actualRevenue =
      actualRevenue !== undefined ? actualRevenue : updatedInvoice.actualRevenue;
    updatedInvoice.status = status !== undefined ? status : updatedInvoice.status;

    // Save the updated invoice
    await updatedInvoice.save();

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteRevenueInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await RevenueInvoiceModel.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ error: 'Revenue invoice not found' });
    }

    await invoice.destroy();
    res.status(200).json({ message: 'Revenue invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting revenue invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createRevenueInvoice,
  getRevenueInvoices,
  getRevenueInvoiceById,
  updateRevenueInvoiceById,
  getRevenueInvoicesByRevenueId,
  deleteRevenueInvoiceById,
};
