const { Op } = require('sequelize');
const InvoiceModel = require('../models/invoiceModel');
const PurchaseOrder = require('../models/poModel');
const logger = require('../utils/logger');

InvoiceModel.afterSave(async (invoice) => {
  const poId = invoice.poId;
  try {
    const [totalInvoiceAmount, totalForecastAmount, purchaseOrder] = await Promise.all([
      InvoiceModel.sum('invoiceAmount', { where: { poId } }),
      InvoiceModel.sum('forecastAmount', { where: { poId } }),
      PurchaseOrder.findByPk(poId),
    ]);
    await PurchaseOrder.update(
      { poPrice: totalInvoiceAmount, poForecast: totalForecastAmount },
      { where: { id: poId }, hooks: false }
    );
    if (purchaseOrder) {
      await InvoiceModel.update(
        { currencyCode: purchaseOrder.currencyCode },
        { where: { id: invoice.dataValues.id } }
      );
    }
  } catch (error) {
    logger.error('InvoiceModel afterSave hook error:', error);
  }
});

const createInvoice = async (req, res) => {
  try {
    const { poId, invoiceAmount, invoiceDate, forecastAmount } = req.body;

    await checkInvoiceAmount(poId, invoiceAmount);

    const parsedInvoiceDate = new Date(invoiceDate);
    const invoiceMonth = parsedInvoiceDate.toISOString().slice(0, 7);

    const existingInvoice = await InvoiceModel.findOne({
      where: {
        poId,
        invoiceDate: {
          [Op.between]: [`${invoiceMonth}-01`, `${invoiceMonth}-30`],
        },
      },
    });

    let responseInvoice;
    if (existingInvoice) {
      // If an invoice exists for the same month and purchase order, update its amount
      existingInvoice.invoiceAmount = Number(existingInvoice.invoiceAmount) + Number(invoiceAmount);
      existingInvoice.forecastAmount =
        Number(existingInvoice.forecastAmount) + Number(forecastAmount);
      responseInvoice = await existingInvoice.save();
    } else {
      // If no invoice exists for the same month and purchase order, create a new invoice
      responseInvoice = await InvoiceModel.create({
        poId,
        invoiceAmount,
        forecastAmount,
        invoiceDate: parsedInvoiceDate,
      });
    }

    // Update poStatus based on poPrice
    await updatePoStatus(poId);
    res.status(200).json(responseInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createInvoiceByPoId = async (req, res) => {
  try {
    const { poId } = req.params;
    const { invoiceAmount, invoiceDate, forecastAmount } = req.body;
    // console.log(invoiceAmount,invoiceDate,forecastAmount )

    // if (!invoiceAmount || !invoiceDate) {
    //   return res
    //     .status(400)
    //     .json({ error: "Both invoiceAmount and invoiceDate are required" });
    // }

    if (invoiceAmount === 0 && invoiceDate === '' && forecastAmount === 0) {
      const responseInvoice = await InvoiceModel.create({
        poId,
        invoiceAmount,
        forecastAmount,
        invoiceDate: null,
      });

      res.status(200).json(responseInvoice);
    } else {
      await checkInvoiceAmount(poId, invoiceAmount);

      const parsedInvoiceDate = new Date(invoiceDate);
      const invoiceMonth = parsedInvoiceDate.toISOString().slice(0, 7);

      const existingInvoice = await InvoiceModel.findOne({
        where: {
          poId,
          invoiceDate: {
            [Op.between]: [`${invoiceMonth}-01`, `${invoiceMonth}-30`],
          },
        },
      });

      let responseInvoice;
      if (existingInvoice) {
        // If an invoice exists for the same month and purchase order, update its amount
        existingInvoice.invoiceAmount =
          Number(existingInvoice.invoiceAmount) + Number(invoiceAmount);
        existingInvoice.forecastAmount =
          Number(existingInvoice.forecastAmount) + Number(forecastAmount);
        responseInvoice = await existingInvoice.save();
      } else {
        // If no invoice exists for the same month and purchase order, create a new invoice
        responseInvoice = await InvoiceModel.create({
          poId,
          invoiceAmount,
          forecastAmount,
          invoiceDate: parsedInvoiceDate,
        });
      }

      // Update poStatus based on poPrice
      await updatePoStatus(poId);
      res.status(200).json(responseInvoice);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getInvoice = async (req, res) => {
  try {
    const invoices = await InvoiceModel.findAll({
      include: [{ model: PurchaseOrder, as: 'invoicePo' }],
    });
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error retrieving invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceModel.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error retrieving invoice by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getInvoicesByPoId = async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await InvoiceModel.findAll({
      where: { po_id: id },
      include: [{ model: PurchaseOrder, as: 'invoicePo' }],
      order: [['invoice_date', 'DESC']],
    });
    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ error: 'No invoices found for the specified PO ID' });
    }
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error retrieving invoices by PO ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { invoiceAmount, invoiceDate, forecastAmount } = req.body;

    if (!invoiceAmount && !invoiceDate && !forecastAmount) {
      return res.status(400).json({
        error: 'Either invoiceAmount or forecastAmount or invoiceDate are required',
      });
    }

    const invoice = await InvoiceModel.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const previousAmount = invoice.invoiceAmount;

    if (invoiceDate) {
      const parsedInvoiceDate = new Date(invoiceDate);
      const invoiceMonth = parsedInvoiceDate.toISOString().slice(0, 7);

      const existingInvoice = await InvoiceModel.findOne({
        where: {
          id: { [Op.not]: id },
          poId: invoice.poId,
          invoiceDate: {
            [Op.between]: [`${invoiceMonth}-01`, `${invoiceMonth}-30`],
          },
        },
      });

      if (existingInvoice) {
        await existingInvoice.destroy();
      }

      invoice.invoiceDate = parsedInvoiceDate;
    }

    invoice.invoiceAmount = invoiceAmount !== undefined ? invoiceAmount : invoice.invoiceAmount;
    invoice.forecastAmount = forecastAmount !== undefined ? forecastAmount : invoice.forecastAmount;

    // Check if invoice amount exceeds PO amount
    await checkInvoiceAmount(invoice.poId, invoice.invoiceAmount - previousAmount);

    const updatedInvoice = await invoice.save();

    // Update poStatus based on poPrice
    await updatePoStatus(invoice.poId);

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceModel.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Retrieve the associated revenue
    const purchase = await PurchaseOrder.findByPk(invoice.poId);
    if (purchase) {
      // Subtract the invoice's amounts from the revenue
      purchase.poPrice -= invoice.invoiceAmount || 0;
      purchase.poForecast -= invoice.forecastAmount || 0;
      await purchase.save();
    }

    await invoice.destroy();
    await updatePoStatus(invoice.poId);

    res.status(200).json({ message: 'invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// helper function

const checkInvoiceAmount = async (poId, newInvoiceAmount) => {
  const po = await PurchaseOrder.findByPk(poId);
  if (!po) {
    throw new Error('Purchase Order not found');
  }

  const totalInvoiceAmount = await InvoiceModel.sum('invoiceAmount', {
    where: { poId },
  });
  // console.log(Number(totalInvoiceAmount));
  // console.log(newInvoiceAmount);
  // console.log(po.poAmount);
  if (Number(totalInvoiceAmount) + Number(newInvoiceAmount) > Number(po.poAmount)) {
    throw new Error('Total invoice amount exceeds PO amount');
  }
};

const updatePoStatus = async (poId) => {
  try {
    const po = await PurchaseOrder.findByPk(poId);
    if (!po) {
      throw new Error('Purchase Order not found');
    }

    if (po.poPrice === 0) {
      await po.update({ poStatus: 'pending' }, { hooks: false });
    } else if (po.poPrice < po.poAmount) {
      await po.update({ poStatus: 'open' }, { hooks: false });
    } else if (po.poPrice === po.poAmount) {
      await po.update({ poStatus: 'closed' }, { hooks: false });
    }
  } catch (error) {
    logger.error('updatePoStatus error:', error);
    throw new Error(error.message, { cause: error });
  }
};

module.exports = {
  createInvoice,
  getInvoice,
  getInvoiceById,
  updateInvoiceById,
  getInvoicesByPoId,
  createInvoiceByPoId,
  deleteInvoiceById,
};
