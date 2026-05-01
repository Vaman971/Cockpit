const User = require('../models/userModel');
const Oppurtunities = require('../models/opportunityModel');
const Project = require('../models/projectModel');
const logger = require('../utils/logger');

// ─── Hook: auto-create/update project on opportunity status change ──────────

Oppurtunities.afterUpdate(async (opportunity) => {
  const changes = opportunity.changed();
  if (!changes) {
    return;
  }

  try {
    const existingProject = await Project.findOne({ where: { oppurtunity_id: opportunity.id } });
    const projectFields = {
      projectLead: opportunity.ledBy,
      cluster: opportunity.cluster,
      region: opportunity.OpRegion,
      siglum: opportunity.Siglum,
    };

    if (opportunity.status === 'Won') {
      if (existingProject) {
        await Project.update(
          { ...projectFields, active: true },
          { where: { oppurtunity_id: opportunity.id }, individualHooks: true }
        );
        logger.info(`Project reactivated for won opportunity #${opportunity.id}`);
      } else {
        await Project.create({
          project_title:
            opportunity.dataValues.OpDescription ||
            `Project for Opportunity #${opportunity.dataValues.id}`,
          projectLead: opportunity.dataValues.ledBy,
          oppurtunity_id: opportunity.dataValues.id,
          cluster: opportunity.dataValues.cluster,
          region: opportunity.dataValues.OpRegion,
          siglum: opportunity.dataValues.Siglum,
          projectType: opportunity.dataValues.opportunityType,
        });
        logger.info(`New project created for won opportunity #${opportunity.id}`);
      }
    } else if (existingProject) {
      await Project.update(
        { ...projectFields, active: false },
        { where: { oppurtunity_id: opportunity.id }, individualHooks: true }
      );
      logger.info(
        `Project deactivated for opportunity #${opportunity.id} (status: ${opportunity.status})`
      );
    }
  } catch (error) {
    logger.error('Error in opportunity afterUpdate hook:', error);
  }
});

// ─── Controllers ─────────────────────────────────────────────────────────────

const createOpportunity = async (req, res, next) => {
  try {
    const opp = await Oppurtunities.create(req.body);
    return res.status(201).json({ success: true, opportunity: opp });
  } catch (error) {
    logger.error('createOpportunity error:', error);
    next(error);
  }
};

const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Oppurtunities.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: 'ledByUser' },
        { model: User, as: 'supportedByUser' },
      ],
    });
    if (!opportunity) {
      return res.status(404).json({ success: false, error: 'Opportunity not found.' });
    }
    return res.status(200).json({ success: true, opportunity });
  } catch (error) {
    logger.error('getOpportunityById error:', error);
    next(error);
  }
};

const getOpportunity = async (req, res, next) => {
  try {
    const opportunities = await Oppurtunities.findAll({
      include: [
        { model: User, as: 'ledByUser' },
        { model: User, as: 'supportedByUser' },
      ],
    });
    return res.status(200).json({ success: true, opportunities });
  } catch (error) {
    logger.error('getOpportunity error:', error);
    next(error);
  }
};

const getLatestOpportunities = async (req, res, next) => {
  try {
    const opportunities = await Oppurtunities.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'ledByUser' },
        { model: User, as: 'supportedByUser' },
      ],
    });
    return res.status(200).json({ success: true, opportunities });
  } catch (error) {
    logger.error('getLatestOpportunities error:', error);
    next(error);
  }
};

const updateOpportunity = async (req, res, next) => {
  try {
    const [affectedRows] = await Oppurtunities.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Opportunity not found.' });
    }
    const updated = await Oppurtunities.findByPk(req.params.id);
    return res.status(200).json({ success: true, opportunity: updated });
  } catch (error) {
    logger.error('updateOpportunity error:', error);
    next(error);
  }
};

module.exports = {
  createOpportunity,
  getOpportunityById,
  getOpportunity,
  updateOpportunity,
  getLatestOpportunities,
};
