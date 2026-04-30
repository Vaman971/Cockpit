const { Op } = require('sequelize');
const RevenueModel = require('../models/revenueModel');
const savingModel = require('../models/savingModel');
const logger = require('../utils/logger');

savingModel.afterSave(async (saving) => {
  try {
    const revenueId = saving.revenueId;
    const totalSavingAmount = await savingModel.sum('savingAmount', { where: { revenueId } });
    const revenue = await RevenueModel.findByPk(revenueId);
    if (revenue) {
      await revenue.update({ saving: totalSavingAmount }, { hooks: false });
    }
  } catch (error) {
    logger.error('savingModel afterSave hook error:', error);
  }
});

savingModel.beforeDestroy(async (saving) => {
  try {
    const revenue = await RevenueModel.findByPk(saving.revenueId);
    if (revenue) {
      await revenue.update(
        { saving: Math.max(0, (revenue.saving || 0) - (saving.savingAmount || 0)) },
        { hooks: false }
      );
    }
  } catch (error) {
    logger.error('savingModel beforeDestroy hook error:', error);
  }
});

const createSaving = async (req, res, next) => {
  try {
    const { revenueId } = req.params;
    const { remark, savingAmount, savingDate } = req.body;

    if (!savingDate || !savingAmount) {
      return res.status(400).json({ error: 'either savingDate or savingAmount is required' });
    }

    const parsedSavingDate = new Date(savingDate);
    const savingMonth = parsedSavingDate.toISOString().slice(0, 7);

    const existingSaving = await savingModel.findOne({
      where: {
        revenueId,
        savingDate: {
          [Op.between]: [`${savingMonth}-01`, `${savingMonth}-30`],
        },
      },
    });

    if (existingSaving) {
      // If an invoice exists for the same month and revenue, update its amount
      existingSaving.savingAmount = Number(existingSaving.savingAmount) + Number(savingAmount);
      await existingSaving.save();
      res.status(200).json(existingSaving);
    } else {
      // If no invoice exists for the same month and revenue, create a new invoice
      const newSaving = await savingModel.create({
        revenueId,
        savingAmount,
        remark,
        savingDate: parsedSavingDate,
      });
      res.status(200).json(newSaving);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getSavings = async (req, res) => {
  try {
    const savings = await savingModel.findAll({
      include: [{ model: RevenueModel, as: 'savingRevenue' }],
    });
    res.status(200).json(savings);
  } catch (error) {
    console.error('Error retrieving savings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSavingsById = async (req, res) => {
  try {
    const { id } = req.params;
    const savings = await savingModel.findByPk(id);
    if (!savings) {
      return res.status(404).json({ error: 'savings not found' });
    }
    res.status(200).json(savings);
  } catch (error) {
    console.error('Error retrieving savings by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSavingsByRevenueId = async (req, res) => {
  try {
    const { id } = req.params;
    const savings = await savingModel.findAll({
      where: { revenueId: id },
      include: [{ model: RevenueModel, as: 'savingRevenue' }],
      order: [['savingDate', 'DESC']],
    });
    if (!savings || savings.length === 0) {
      return res.status(404).json({ error: 'No savings found for the specified revenue ID' });
    } else {
      res.status(200).json(savings);
    }
  } catch (error) {
    console.error('Error retrieving savings by revenue ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSavingsById = async (req, res) => {
  try {
    const { id } = req.params;
    const { savingAmount, savingDate, remark } = req.body;

    if (!savingAmount && !savingDate && !remark) {
      return res.status(400).json({ error: 'No input from User' });
    }
    if (savingDate) {
      const parsedSavingeDate = new Date(savingDate);
      const savingMonth = parsedSavingeDate.toISOString().slice(0, 7);

      const existingSaving = await savingModel.findOne({
        where: {
          id: {
            [Op.not]: id, // Exclude the invoice being updated
          },
          savingDate: {
            [Op.between]: [`${savingMonth}-01`, `${savingMonth}-30`],
          },
        },
      });

      if (existingSaving) {
        // If an invoice exists for the same month and revenue, destroy it
        await existingSaving.destroy();
      }
    }

    // Update the invoice being updated
    const updatedSaving = await savingModel.findByPk(id);

    if (!updatedSaving) {
      res.status(404).json({ error: 'Revenue invoice not found' });
    }

    updatedSaving.savingAmount =
      savingAmount !== undefined ? savingAmount : updatedSaving.savingAmount;
    updatedSaving.savingDate =
      savingDate !== undefined ? new Date(savingDate) : updatedSaving.savingDate;
    updatedSaving.remark = remark !== undefined ? remark : updatedSaving.remark;

    // Save the updated invoice
    await updatedSaving.save();

    res.status(200).json(updatedSaving);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSavingById = async (req, res) => {
  try {
    const { id } = req.params;
    const saving = await savingModel.findByPk(id);

    if (!saving) {
      return res.status(404).json({ error: 'Saving not found' });
    }

    await saving.destroy();
    res.status(200).json({ message: 'Savings deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createSaving,
  getSavings,
  getSavingsById,
  updateSavingsById,
  getSavingsByRevenueId,
  deleteSavingById,
};
