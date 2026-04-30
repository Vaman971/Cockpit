const Project = require('../models/projectModel');
const Oppurtunity = require('../models/opportunityModel');
const MissionCard = require('../models/missionModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');

// ─── Hooks ───────────────────────────────────────────────────────────────────

Project.afterCreate(async (project) => {
  try {
    await MissionCard.create({
      missionCardLeader: null,
      missionCardDuration: null,
      missionDescription: project.dataValues.project_title || '-',
      missionStartDate: new Date(),
      missionEndDate: null,
      projMissionId: project.dataValues.id,
      cluster: project.dataValues.cluster,
      region: project.dataValues.region,
      siglum: project.dataValues.siglum,
      missionType: project.dataValues.projectType,
      missionCardTeam: 'Default Team',
      active: true,
    });
    logger.info(`Default mission card created for project #${project.dataValues.id}`);
  } catch (error) {
    logger.error('Error creating default mission card:', error);
  }
});

Project.afterUpdate(async (project) => {
  try {
    const changes = project.changed();
    const fieldsToPropagate = ['active', 'cluster', 'region', 'siglum'];
    const affected = fieldsToPropagate.filter((f) => changes.includes(f));

    if (affected.length === 0) {
      return;
    }

    const missionCardList = await MissionCard.findAll({
      where: { projMissionId: project.dataValues.id },
    });

    const updates = {};
    if (changes.includes('active')) {
      updates.active = project.dataValues.active;
    }
    if (changes.includes('cluster')) {
      updates.cluster = project.dataValues.cluster;
    }
    if (changes.includes('region')) {
      updates.region = project.dataValues.region;
    }
    if (changes.includes('siglum')) {
      updates.siglum = project.dataValues.siglum;
    }

    for (const missionCard of missionCardList) {
      await missionCard.update(updates);
    }
    logger.info(`Project #${project.dataValues.id} propagated changes: ${affected.join(', ')}`);
  } catch (error) {
    logger.error('Error propagating project update to mission cards:', error);
  }
});

// ─── Controllers ─────────────────────────────────────────────────────────────

const updateProject = async (req, res, next) => {
  try {
    const [affectedRows] = await Project.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    const updatedProject = await Project.findByPk(req.params.id);
    return res.status(200).json({ success: true, project: updatedProject });
  } catch (error) {
    logger.error('updateProject error:', error);
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const existingProject = await Project.findOne({ where: { oppurtunity_id: req.params.id } });
    if (!existingProject) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    await Project.update({ active: false }, { where: { oppurtunity_id: req.params.id } });
    logger.info(`Project soft-deleted for opportunity #${req.params.id}`);
    return res.status(200).json({ success: true, message: 'Project deactivated.' });
  } catch (error) {
    logger.error('deleteProject error:', error);
    next(error);
  }
};

const getProjectByOpportunityId = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: { oppurtunity_id: req.params.oppurtunity_id },
      include: [{ model: Oppurtunity, as: 'ProjOpp' }],
    });
    if (projects.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'No projects found for this opportunity.' });
    }
    return res.status(200).json({ success: true, projects });
  } catch (error) {
    logger.error('getProjectByOpportunityId error:', error);
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id },
      include: [{ model: Oppurtunity, as: 'ProjOpp' }],
    });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    return res.status(200).json({ success: true, project });
  } catch (error) {
    logger.error('getProjectById error:', error);
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      include: [{ model: Oppurtunity, as: 'ProjOpp' }],
    });
    return res.status(200).json({ success: true, projects });
  } catch (error) {
    logger.error('getProject error:', error);
    next(error);
  }
};

const getProjectExcelData = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      attributes: [
        'id',
        'region',
        'project_title',
        'projectLead',
        'projectType',
        'cluster',
        'siglum',
        'created_on',
        'updated_on',
        'active',
        'status',
      ],
      include: [
        {
          model: Oppurtunity,
          attributes: [
            'id',
            'OpDescription',
            'status',
            'ledBy',
            'cluster',
            'Siglum',
            'createdAt',
            'updatedAt',
          ],
          as: 'ProjOpp',
        },
        { model: User, attributes: ['username'], as: 'leadUser' },
      ],
      raw: true,
      nest: true,
    });
    const formatted = projects.map((p) => ({
      id: p.id,
      region: p.region,
      project_title: p.project_title,
      projectLead: p.leadUser?.username,
      projectType: p.projectType,
      cluster: p.cluster,
      siglum: p.siglum,
      created_on: p.created_on,
      updated_on: p.updated_on,
      active: p.active,
      status: p.status,
    }));
    return res.status(200).json({ success: true, projects: formatted });
  } catch (error) {
    logger.error('getProjectExcelData error:', error);
    next(error);
  }
};

module.exports = {
  updateProject,
  deleteProject,
  getProjectById,
  getProject,
  getProjectByOpportunityId,
  getProjectExcelData,
};
