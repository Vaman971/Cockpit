/**
 * extensionController — renamed from extentionController.
 * All internal references use 'Extension' spelling.
 * DB field names that map to columns (e.g. extentionProjectId) preserved via model field mapping.
 */
const ExtensionInvoice = require('../models/extensionInvoice');
const ExtensionModel = require('../models/extensionModel');
const MissionCard = require('../models/missionModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');

// ─── Hook ────────────────────────────────────────────────────────────────────

ExtensionModel.afterUpdate(async (extension) => {
  try {
    const invoices = await ExtensionInvoice.findAll({
      where: { extensionId: extension.dataValues.id },
    });
    await Promise.all(
      invoices.map((invoice) => invoice.update({ currencyCode: extension.dataValues.currencyCode }))
    );
  } catch (error) {
    logger.error('ExtensionModel afterUpdate hook error:', error);
  }
});

// ─── Helper: compute date range from mission cards ───────────────────────────

const computeDateRange = (missions) => {
  let startDate = null;
  let endDate = null;
  for (let i = 0; i < missions.length; i++) {
    const missionStart = new Date(missions[i].dataValues.missionStartDate);
    const missionEnd = new Date(missions[i].dataValues.missionEndDate);
    if (i + 1 < missions.length) {
      const nextStart = new Date(missions[i + 1].dataValues.missionStartDate);
      const nextEnd = new Date(missions[i + 1].dataValues.missionEndDate);
      if (!startDate || missionStart <= nextStart) {
        startDate = missionStart;
      }
      if (!endDate || missionEnd <= nextEnd) {
        endDate = nextEnd;
      }
    } else {
      if (!startDate) {
        startDate = missionStart;
      }
      if (!endDate) {
        endDate = missionEnd;
      }
    }
  }
  return { startDate, endDate };
};

// ─── Controllers ─────────────────────────────────────────────────────────────

const createExtension = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.body.extensionProjectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    const missions = await MissionCard.findAll({ where: { projMissionId: project.dataValues.id } });
    const { startDate, endDate } = computeDateRange(missions);

    req.body.cluster = project.dataValues.cluster;
    req.body.region = project.dataValues.region;
    req.body.siglum = project.dataValues.siglum;
    req.body.description = project.dataValues.project_title;
    req.body.extensionStartDate = startDate;
    req.body.extensionEndDate = endDate;

    const created = await ExtensionModel.create(req.body);
    return res.status(201).json({ success: true, extension: created });
  } catch (error) {
    logger.error('createExtension error:', error);
    next(error);
  }
};

const getExtensions = async (req, res, next) => {
  try {
    const extensions = await ExtensionModel.findAll({
      include: [
        { model: Project, as: 'projectExtension' },
        { model: User, as: 'assignedProjectLeader' },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ success: true, extensions });
  } catch (error) {
    logger.error('getExtensions error:', error);
    next(error);
  }
};

const getExtensionById = async (req, res, next) => {
  try {
    const extension = await ExtensionModel.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'projectExtension' },
        { model: User, as: 'assignedProjectLeader' },
      ],
    });
    if (!extension) {
      return res.status(404).json({ success: false, error: 'Extension not found.' });
    }
    return res.status(200).json({ success: true, extension });
  } catch (error) {
    logger.error('getExtensionById error:', error);
    next(error);
  }
};

const updateExtension = async (req, res, next) => {
  try {
    if (req.body.extensionProjectId) {
      const project = await Project.findByPk(req.body.extensionProjectId);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }
      const missions = await MissionCard.findAll({
        where: { projMissionId: project.dataValues.id },
      });
      const { startDate, endDate } = computeDateRange(missions);
      req.body.cluster = project.dataValues.cluster;
      req.body.region = project.dataValues.region;
      req.body.siglum = project.dataValues.siglum;
      req.body.extensionStartDate = startDate;
      req.body.extensionEndDate = endDate;
    }

    const [updatedRowsCount] = await ExtensionModel.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });
    if (updatedRowsCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Extension not found or no changes made.' });
    }
    return res.status(200).json({ success: true, message: 'Extension updated successfully.' });
  } catch (error) {
    logger.error('updateExtension error:', error);
    next(error);
  }
};

const getExtensionInvoices = async (req, res, next) => {
  try {
    const invoices = await ExtensionInvoice.findAll({ where: { extensionId: req.params.id } });
    return res.status(200).json({ success: true, invoices });
  } catch (error) {
    logger.error('getExtensionInvoices error:', error);
    next(error);
  }
};

module.exports = {
  createExtension,
  getExtensions,
  getExtensionById,
  updateExtension,
  getExtensionInvoices,
};
