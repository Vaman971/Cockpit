const ExtentionInvoice = require('../models/extentionInvoice');
const ExtentionModel = require('../models/extentionModel');
const MissionCard = require('../models/missionModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');

ExtentionModel.afterUpdate(async (extention) => {
  try {
    const invoices = await ExtentionInvoice.findAll({
      where: { extentionId: extention.dataValues.id },
    });
    await Promise.all(
      invoices.map((invoice) => invoice.update({ currencyCode: extention.dataValues.currencyCode }))
    );
  } catch (error) {
    logger.error('ExtentionModel afterUpdate hook error:', error);
  }
});

const createExtention = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.body.extentionProjectId);
    const missions = await MissionCard.findAll({ where: { projMissionId: project.dataValues.id } });

    let startDate = null;
    let endDate = null;

    for (let index = 0; index < missions.length; index++) {
      const missionStart = new Date(missions[index].dataValues.missionStartDate);
      const missionEnd = new Date(missions[index].dataValues.missionEndDate);

      // Check if there is a next mission before accessing it
      if (index + 1 < missions.length) {
        const nextMissionStart = new Date(missions[index + 1].dataValues.missionStartDate);
        const nextMissionEnd = new Date(missions[index + 1].dataValues.missionEndDate);

        if (!startDate || missionStart <= nextMissionStart) {
          startDate = missionStart;
        }
        if (!endDate || missionEnd <= nextMissionEnd) {
          endDate = nextMissionEnd;
        }
      } else {
        // If it's the last mission, set startDate and endDate if they haven't been set
        if (!startDate) {
          startDate = missionStart;
        }
        if (!endDate) {
          endDate = missionEnd;
        }
      }
    }

    // Set the cluster, region, and siglum based on the project
    req.body.cluster = project.dataValues.cluster;
    req.body.region = project.dataValues.region;
    req.body.siglum = project.dataValues.siglum;
    req.body.description = project.dataValues.project_title;
    req.body.extentionStartDate = startDate;
    req.body.extentionEndDate = endDate;

    const extentionCreated = await ExtentionModel.create(req.body);
    return res.status(201).json({ success: true, extension: extentionCreated });
  } catch (error) {
    logger.error('createExtention error:', error);
    next(error);
  }
};

// getAll
const getExtention = async (req, res) => {
  try {
    const extentionList = await ExtentionModel.findAll({
      include: [
        { model: Project, as: 'projectExtention' },
        { model: User, as: 'assignedProjectLeader' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(extentionList);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//getbyId
const getExtentionById = async (req, res) => {
  try {
    const { id } = req.params;
    const extention = await ExtentionModel.findByPk(id, {
      include: [
        { model: Project, as: 'projectExtention' },
        { model: User, as: 'assignedProjectLeader' },
      ],
    });

    if (!extention) {
      return res.status(404).json({ error: 'Extention not found' });
    }

    res.json(extention);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// update the poRouter
const updateExtention = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.extentionProjectId) {
      const project = await Project.findByPk(req.body.extentionProjectId);

      const missions = await MissionCard.findAll({
        where: { projMissionId: project.dataValues.id },
      });

      let startDate = null;
      let endDate = null;

      for (let index = 0; index < missions.length; index++) {
        const missionStart = new Date(missions[index].dataValues.missionStartDate);
        const missionEnd = new Date(missions[index].dataValues.missionEndDate);

        // Check if there is a next mission before accessing it
        if (index + 1 < missions.length) {
          const nextMissionStart = new Date(missions[index + 1].dataValues.missionStartDate);
          const nextMissionEnd = new Date(missions[index + 1].dataValues.missionEndDate);

          if (!startDate || missionStart <= nextMissionStart) {
            startDate = missionStart;
          }
          if (!endDate || missionEnd <= nextMissionEnd) {
            endDate = nextMissionEnd;
          }
        } else {
          // If it's the last mission, set startDate and endDate if they haven't been set
          if (!startDate) {
            startDate = missionStart;
          }
          if (!endDate) {
            endDate = missionEnd;
          }
        }
      }

      req.body.cluster = project.dataValues.cluster;
      req.body.region = project.dataValues.region;
      req.body.siglum = project.dataValues.siglum;
      req.body.extentionStartDate = startDate;
      req.body.extentionEndDate = endDate;
    }

    const [updatedRowsCount] = await ExtentionModel.update(req.body, {
      where: { id },
      individualHooks: true,
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Edit atleast one field' });
    }

    res.json({ success: true, message: 'Extention updated successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExtentionInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await ExtentionInvoice.findAll({
      where: { extentionId: id },
    });
    res.json(invoices);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createExtention,
  getExtention,
  getExtentionById,
  updateExtention,
  getExtentionInvoices,
};
