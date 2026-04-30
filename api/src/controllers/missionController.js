const Project = require('../models/projectModel');
const MissionCard = require('../models/missionModel');
const PurchaseOrder = require('../models/poModel');
const User = require('../models/userModel');
const RevenueModel = require('../models/revenueModel');
const Team = require('../models/TeamModel');
const UserProfile = require('../models/profileModel');
const UserTeams = require('../models/UserTeams');
const Customer = require('../models/customerModel');
const logger = require('../utils/logger');

MissionCard.afterCreate(async (mission, options) => {
  try {
    console.log(mission);
    if (mission.dataValues.missionType === 'External') {
      await PurchaseOrder.create({
        poDate: Date.now(),
        poDescription: mission.dataValues.missionDescription,
        poMissionId: mission.dataValues.id,
        cluster: mission.dataValues.cluster,
        region: mission.dataValues.region,
        siglum: mission.dataValues.siglum,
        poStatus: 'pending',
      });
      console.log('purchase order created');
      await RevenueModel.create({
        createdAt: Date.now(),
        revenueDescription: mission.dataValues.missionDescription,
        revenueMissionId: mission.dataValues.id,
        cluster: mission.dataValues.cluster,
        region: mission.dataValues.region,
        siglum: mission.dataValues.siglum,
      });
      console.log('revenue table created');
    }
    // Create a new team with the same name as the mission description
    await Team.create({
      mission_card_team_id: mission.dataValues.id,
      team_name: `Team for mission Id ${mission.dataValues.id}`,
      cluster: mission.dataValues.cluster,
      active: true,
    });
    console.log('Team created');

    // Add the mission leader to the team
    // await UserTeams.create({
    //   profile_id: mission.dataValues.missionCardLeader,
    //   team_id: team.id,
    //   active: true,
    // });
    // console.log("Mission leader added to the team");
  } catch (error) {
    console.log('Error creating purchase order or revenue', error.message);
  }
});

MissionCard.beforeUpdate(async (mission) => {
  try {
    const changes = mission.changed();
    // console.log(mission)
    if (changes.includes('status') && mission.dataValues.status !== 'Closed') {
      const team = await Team.findOne({ where: { mission_card_team_id: mission.dataValues.id } });

      if (team) {
        const teamMembers = await UserTeams.findAll({
          where: { team_id: team.dataValues.id },
        });

        for (const user of teamMembers) {
          // console.log(user)

          const profile = await UserProfile.findOne({
            where: { id: user.dataValues.profile_id },
          });
          if (!profile) {
            throw new Error('No profile found');
          }

          const occupancy =
            Number(profile.dataValues.total_occupancy) + Number(user.dataValues.occupancy);

          // console.log('*********The occupancy of the user is:*************'+ profile.dataValues.total_occupancy)
          if (occupancy > 100) {
            throw new Error(
              'Can not update,some exsisting team member is already occupied somewhere else'
            );
          }
        }
      }
    }
  } catch (error) {
    logger.error('MissionCard beforeCreate hook error:', error);
  }
});

MissionCard.afterUpdate(async (mission, options) => {
  try {
    const changes = mission.changed();
    console.log(changes);

    if (changes.includes('missionDescription')) {
      const purchaseOrder = await PurchaseOrder.findAll({
        where: { poMissionId: mission.dataValues.id },
      });
      await purchaseOrder[0].update({
        poDescription: mission.dataValues.missionDescription,
      });
      console.log('purchase order description Updated');

      const revenueModel = await RevenueModel.findAll({
        where: { revenueMissionId: mission.dataValues.id },
      });
      await revenueModel[0].update({
        revenueDescription: mission.dataValues.missionDescription,
      });
      console.log('Revenue description Updated');
    }

    if (changes.includes('cluster')) {
      const purchaseOrder = await PurchaseOrder.findAll({
        where: { poMissionId: mission.dataValues.id },
      });
      await purchaseOrder[0].update({
        cluster: mission.dataValues.cluster,
      });
      console.log('purchase order cluster Updated');

      const revenueModel = await RevenueModel.findAll({
        where: { revenueMissionId: mission.dataValues.id },
      });
      await revenueModel[0].update({
        cluster: mission.dataValues.cluster,
      });
      console.log('Revenue cluster Updated');

      const team = await Team.findAll({
        where: { mission_card_team_id: mission.dataValues.id },
      });
      if (team) {
        await team[0].update({
          cluster: mission.dataValues.cluster,
        });
        console.log('team cluster updated');
      } else {
        throw new Error('No Team found');
      }
    }

    if (changes.includes('active')) {
      const missionStatus = mission.dataValues.active;
      const missionType = mission.dataValues.missionType;

      if (missionType === 'External') {
        const purchaseOrder = await PurchaseOrder.findAll({
          where: { poMissionId: mission.dataValues.id },
        });
        await purchaseOrder[0].update({
          active: missionStatus,
        });
        console.log('purchase order active status Updated');

        const revenueModel = await RevenueModel.findAll({
          where: { revenueMissionId: mission.dataValues.id },
        });
        await revenueModel[0].update({
          active: missionStatus,
        });
        console.log('revenue active status Updated');
      }
    }

    if (changes.includes('region')) {
      const purchaseOrder = await PurchaseOrder.findAll({
        where: { poMissionId: mission.dataValues.id },
      });
      await purchaseOrder[0].update({
        region: mission.dataValues.region,
      });
      console.log('purchase order region Updated');

      const revenueModel = await RevenueModel.findAll({
        where: { revenueMissionId: mission.dataValues.id },
      });
      await revenueModel[0].update({
        region: mission.dataValues.region,
      });
      console.log('Revenue region Updated');
    }

    if (changes.includes('siglum')) {
      const purchaseOrder = await PurchaseOrder.findAll({
        where: { poMissionId: mission.dataValues.id },
      });
      await purchaseOrder[0].update({
        siglum: mission.dataValues.siglum,
      });
      console.log('purchase order siglum Updated');

      const revenueModel = await RevenueModel.findAll({
        where: { revenueMissionId: mission.dataValues.id },
      });
      await revenueModel[0].update({
        siglum: mission.dataValues.siglum,
      });
      console.log('Revenue siglum Updated');
    }
    //afterupdate - status close to be reflected in occupancy
    if (changes.includes('status')) {
      const teamModel = await Team.findOne({
        where: { mission_card_team_id: mission.dataValues.id },
      });
      if (teamModel) {
        if (mission.dataValues.status === 'Closed') {
          await teamModel.update({ active: false });
          // console.log("Team deactivated");
        } else {
          await teamModel.update({ active: true });
          // console.log("Team activated");
        }
      } else {
        throw new Error('No Team found');
      }

      const project = await Project.findOne({ where: { id: mission.dataValues.projMissionId } });

      const associatedMission = await MissionCard.findAll({
        where: { projMissionId: project.dataValues.id },
      });

      let projectStatus = false;
      associatedMission.forEach((missions) => {
        if (missions.dataValues.status !== 'Closed') {
          projectStatus = true;
        }
      });

      await project.update({ status: projectStatus });
    }
  } catch (error) {
    console.log(error.message);
  }
});

//create
const createMission = async (req, res) => {
  try {
    // Fetch the associated project
    const project = await Project.findByPk(req.body.projMissionId);

    // Set the cluster of the mission to the cluster of the project
    req.body.cluster = project.dataValues.cluster;
    req.body.region = project.dataValues.region;
    req.body.siglum = project.dataValues.siglum;
    req.body.missionType = project.dataValues.projectType;

    const missionCard = await MissionCard.create(req.body);
    res.json(missionCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateMission = async (req, res) => {
  try {
    if (req.body.projMissionId) {
      const project = await Project.findByPk(req.body.projMissionId);
      req.body.cluster = project.dataValues.cluster;
      req.body.region = project.dataValues.region;
      req.body.siglum = project.dataValues.siglum;
    }

    const updatedMission = await MissionCard.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });
    res.json(updatedMission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//get by id mission cards
const getMissionById = async (req, res) => {
  try {
    const updatedMissionCard = await MissionCard.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'missionCards' },
        { model: User, as: 'assignedMissionCards' },
        { model: PurchaseOrder, as: 'projectPo' },
      ],
    });
    res.json(updatedMissionCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//get latest five mission
const getLatestMission = async (req, res) => {
  try {
    const latestMission = await MissionCard.findAll({
      limit: 5, // Limit the result to 5 records
      order: [['createdAt', 'DESC']], // Order by createdAt field in descending order
      include: [
        { model: Project, as: 'missionCards' },
        { model: User, as: 'assignedMissionCards' },
      ],
    });

    res.status(200).json(latestMission);
  } catch (error) {
    res.status(404).json({ message: 'Mission Not found with ' + error.message });
  }
};
const getMissionsByProjectId = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(projMissionId);
    const missions = await MissionCard.findAll({
      where: {
        projMissionId: id,
      },
      include: [
        {
          model: Project,
          as: 'missionCards',
        },
      ],
    });

    if (missions.length === 0) {
      return res.status(404).json({ message: 'No missions found for this project ID' });
    }

    res.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ message: 'Error fetching missions', error });
  }
};

//getAll mission with respect to user and projects
const getMission = async (req, res) => {
  try {
    const mission = await MissionCard.findAll({
      include: [
        { model: Project, as: 'missionCards' },
        { model: User, as: 'assignedMissionCards' },
      ],
    });
    res.json(mission);
  } catch (error) {
    console.error(error);
  }
};

const assignCustomerToMission = async (req, res) => {
  const { missionId } = req.params;
  const { customerIds } = req.body;

  const processedIds = Array.isArray(customerIds) ? customerIds : [customerIds];

  if (!Array.isArray(processedIds) || processedIds.length === 0) {
    return res.status(400).json({ message: 'No Customer Ids Provided' });
  }

  try {
    const mission = await MissionCard.findByPk(missionId);

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    const customers = await Customer.findAll({
      where: {
        customer_id: processedIds,
      },
    });

    if (customers.length !== processedIds.length) {
      return res.status(404).json({ message: 'One or more customers not found' });
    }

    await mission.addCustomers(customers);

    res.status(200).json({
      success: true,
      message: 'Customer assigned to mission succesfully',
      mission,
    });
  } catch (error) {
    console.error('Error assigning customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createMission,
  updateMission,
  getMissionById,
  getMission,
  getLatestMission,
  getMissionsByProjectId,
  assignCustomerToMission,
};
