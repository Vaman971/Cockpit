const { mockModel, mockRow } = require('./helpers/modelMock');

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../models/projectModel', () => mockModel());
jest.mock('../models/missionModel', () => mockModel());
jest.mock('../models/poModel', () => mockModel());
jest.mock('../models/userModel', () =>
  mockModel({
    beforeCreate: jest.fn(),
    beforeUpdate: jest.fn(),
  })
);
jest.mock('../models/revenueModel', () => mockModel());
jest.mock('../models/TeamModel', () => mockModel());
jest.mock('../models/profileModel', () => mockModel());
jest.mock('../models/UserTeams', () => mockModel());
jest.mock('../models/customerModel', () => mockModel());
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(() => 'hashed-sync-password'),
  hash: jest.fn(() => Promise.resolve('hashed-async-password')),
  compare: jest.fn(() => Promise.resolve(true)),
}));
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const Project = require('../models/projectModel');
const MissionCard = require('../models/missionModel');
const PurchaseOrder = require('../models/poModel');
const User = require('../models/userModel');
const RevenueModel = require('../models/revenueModel');
const Team = require('../models/TeamModel');
const UserProfile = require('../models/profileModel');
const UserTeams = require('../models/UserTeams');
const Customer = require('../models/customerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const missionController = require('../controllers/missionController');
const teamController = require('../controllers/teamController');
const userController = require('../controllers/userController');
const verifyAuth = require('../utils/verifyAuth');
const verifyToken = require('../utils/verifyToken');

const missionAfterCreate = MissionCard.afterCreate.mock.calls[0][0];
const missionBeforeUpdate = MissionCard.beforeUpdate.mock.calls[0][0];
const missionAfterUpdate = MissionCard.afterUpdate.mock.calls[0][0];
const teamAfterUpdate = Team.afterUpdate.mock.calls[0][0];
const userTeamsAfterSave = UserTeams.afterSave.mock.calls[0][0];
const userTeamsBeforeDestroy = UserTeams.beforeDestroy.mock.calls[0][0];
const userBeforeCreate = User.beforeCreate.mock.calls[0][0];
const userBeforeUpdate = User.beforeUpdate.mock.calls[0][0];

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeMission = (data, changed = Object.keys(data)) => ({
  dataValues: data,
  changed: jest.fn(() => changed),
});

describe('owned backend controller and middleware coverage', () => {
  let next;
  const originalDomain = process.env.ALLOWED_EMAIL_DOMAIN;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
    process.env.ALLOWED_EMAIL_DOMAIN = 'tatatechnologies.com';
  });

  afterAll(() => {
    process.env.ALLOWED_EMAIL_DOMAIN = originalDomain;
  });

  describe('verifyAuth', () => {
    it('rejects requests without a jwt cookie', () => {
      const res = mockRes();

      verifyAuth({ cookies: {} }, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects invalid tokens', () => {
      jwt.verify.mockImplementation((token, secret, cb) => cb(new Error('expired')));
      const res = mockRes();

      verifyAuth({ cookies: { jwtToken: 'bad-token' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('allows leaders and attaches the decoded user', () => {
      const decoded = { user_id: 1, user_type: 'Leader' };
      jwt.verify.mockImplementation((token, secret, cb) => cb(null, decoded));
      const req = { cookies: { jwtToken: 'good-token' } };

      verifyAuth(req, mockRes(), next);

      expect(req.user).toBe(decoded);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('forbids authenticated users without leader or admin role', () => {
      jwt.verify.mockImplementation((token, secret, cb) => cb(null, { user_type: 'Member' }));
      const res = mockRes();

      verifyAuth({ cookies: { jwtToken: 'good-token' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('rejects missing tokens', () => {
      const res = mockRes();

      verifyToken({ cookies: {} }, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects inactive users', () => {
      jwt.verify.mockImplementation((token, secret, cb) => cb(null, { active: false }));
      const res = mockRes();

      verifyToken({ cookies: { jwtToken: 'inactive-token' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('attaches decoded active users and continues', () => {
      const decoded = { user_id: 2, active: true };
      jwt.verify.mockImplementation((token, secret, cb) => cb(null, decoded));
      const req = { cookies: { jwtToken: 'active-token' } };

      verifyToken(req, mockRes(), next);

      expect(req.user).toBe(decoded);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('missionController handlers and hooks', () => {
    it('creates a mission with project-derived location fields', async () => {
      Project.findByPk.mockResolvedValue(
        mockRow({ id: 9, cluster: 'A', region: 'West', siglum: 'SIG', projectType: 'External' })
      );
      const created = { id: 1, missionDescription: 'Build' };
      MissionCard.create.mockResolvedValue(created);
      const req = { body: { projMissionId: 9, missionDescription: 'Build' } };
      const res = mockRes();

      await missionController.createMission(req, res);

      expect(MissionCard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cluster: 'A',
          region: 'West',
          siglum: 'SIG',
          missionType: 'External',
        })
      );
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it('returns 500 when mission creation cannot load project data', async () => {
      Project.findByPk.mockRejectedValue(new Error('db unavailable'));
      const res = mockRes();

      await missionController.createMission({ body: { projMissionId: 4 } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'db unavailable' });
    });

    it('updates a mission using individual hooks and refreshed project fields', async () => {
      Project.findByPk.mockResolvedValue(mockRow({ cluster: 'C', region: 'North', siglum: 'N1' }));
      MissionCard.update.mockResolvedValue([1]);
      const req = { params: { id: '12' }, body: { projMissionId: 3, status: 'Open' } };
      const res = mockRes();

      await missionController.updateMission(req, res);

      expect(MissionCard.update).toHaveBeenCalledWith(
        expect.objectContaining({ cluster: 'C', region: 'North', siglum: 'N1' }),
        { where: { id: '12' }, individualHooks: true }
      );
      expect(res.json).toHaveBeenCalledWith([1]);
    });

    it('returns 404 when no missions exist for a project', async () => {
      MissionCard.findAll.mockResolvedValue([]);
      const res = mockRes();

      await missionController.getMissionsByProjectId({ params: { id: '6' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No missions found for this project ID' });
    });

    it('assigns customers to a mission', async () => {
      const mission = { id: 5, addCustomers: jest.fn().mockResolvedValue(undefined) };
      const customers = [{ customer_id: 1 }, { customer_id: 2 }];
      MissionCard.findByPk.mockResolvedValue(mission);
      Customer.findAll.mockResolvedValue(customers);
      const res = mockRes();

      await missionController.assignCustomerToMission(
        { params: { missionId: '5' }, body: { customerIds: [1, 2] } },
        res
      );

      expect(mission.addCustomers).toHaveBeenCalledWith(customers);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('rejects customer assignment when the mission is missing', async () => {
      MissionCard.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await missionController.assignCustomerToMission(
        { params: { missionId: '404' }, body: { customerIds: 1 } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Mission not found' });
    });

    it('mission afterCreate creates downstream rows for external missions', async () => {
      const mission = makeMission({
        id: 11,
        missionType: 'External',
        missionDescription: 'External build',
        cluster: 'A',
        region: 'EMEA',
        siglum: 'BB',
      });

      await missionAfterCreate(mission);

      expect(PurchaseOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({ poMissionId: 11 })
      );
      expect(RevenueModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ revenueMissionId: 11 })
      );
      expect(Team.create).toHaveBeenCalledWith(
        expect.objectContaining({ mission_card_team_id: 11, active: true })
      );
    });

    it('mission beforeUpdate checks existing team member occupancy on status changes', async () => {
      Team.findOne.mockResolvedValue(mockRow({ id: 20 }));
      UserTeams.findAll.mockResolvedValue([mockRow({ profile_id: 7, occupancy: 15 })]);
      UserProfile.findOne.mockResolvedValue(mockRow({ id: 7, total_occupancy: 70 }));

      await missionBeforeUpdate(makeMission({ id: 3, status: 'Open' }, ['status']));

      expect(UserProfile.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
    });

    it('mission beforeUpdate logs occupancy validation errors', async () => {
      Team.findOne.mockResolvedValue(mockRow({ id: 20 }));
      UserTeams.findAll.mockResolvedValue([mockRow({ profile_id: 7, occupancy: 50 })]);
      UserProfile.findOne.mockResolvedValue(mockRow({ id: 7, total_occupancy: 70 }));

      await missionBeforeUpdate(makeMission({ id: 3, status: 'Open' }, ['status']));

      expect(UserProfile.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
    });

    it('mission afterCreate catches downstream creation failures', async () => {
      Team.create.mockRejectedValue(new Error('team failed'));

      await missionAfterCreate(makeMission({ id: 12, missionType: 'Internal', cluster: 'A' }));

      expect(Team.create).toHaveBeenCalledWith(
        expect.objectContaining({ mission_card_team_id: 12 })
      );
    });

    it('mission afterUpdate mirrors edited fields to purchase orders, revenues, and teams', async () => {
      const poRows = Array.from({ length: 5 }, () => mockRow({ id: 1 }));
      const revenueRows = Array.from({ length: 5 }, () => mockRow({ id: 2 }));
      const teamRows = [mockRow({ id: 3 })];
      PurchaseOrder.findAll
        .mockResolvedValueOnce([poRows[0]])
        .mockResolvedValueOnce([poRows[1]])
        .mockResolvedValueOnce([poRows[2]])
        .mockResolvedValueOnce([poRows[3]])
        .mockResolvedValueOnce([poRows[4]]);
      RevenueModel.findAll
        .mockResolvedValueOnce([revenueRows[0]])
        .mockResolvedValueOnce([revenueRows[1]])
        .mockResolvedValueOnce([revenueRows[2]])
        .mockResolvedValueOnce([revenueRows[3]])
        .mockResolvedValueOnce([revenueRows[4]]);
      Team.findAll.mockResolvedValue(teamRows);

      await missionAfterUpdate(
        makeMission(
          {
            id: 44,
            missionDescription: 'Renamed',
            cluster: 'NewCluster',
            active: false,
            missionType: 'External',
            region: 'South',
            siglum: 'S1',
          },
          ['missionDescription', 'cluster', 'active', 'region', 'siglum']
        )
      );

      expect(poRows[0].update).toHaveBeenCalledWith({ poDescription: 'Renamed' });
      expect(revenueRows[1].update).toHaveBeenCalledWith({ cluster: 'NewCluster' });
      expect(teamRows[0].update).toHaveBeenCalledWith({ cluster: 'NewCluster' });
      expect(poRows[2].update).toHaveBeenCalledWith({ active: false });
      expect(revenueRows[3].update).toHaveBeenCalledWith({ region: 'South' });
      expect(poRows[4].update).toHaveBeenCalledWith({ siglum: 'S1' });
    });

    it('mission afterUpdate deactivates a team and updates project status when closed', async () => {
      const team = mockRow({ id: 10, active: true });
      const project = mockRow({ id: 50, status: true });
      Team.findOne.mockResolvedValue(team);
      Project.findOne.mockResolvedValue(project);
      MissionCard.findAll.mockResolvedValue([mockRow({ status: 'Closed' })]);

      await missionAfterUpdate(
        makeMission({ id: 3, status: 'Closed', projMissionId: 50 }, ['status'])
      );

      expect(team.update).toHaveBeenCalledWith({ active: false });
      expect(project.update).toHaveBeenCalledWith({ status: false });
    });

    it('mission afterUpdate activates a team and keeps project open when any mission is open', async () => {
      const team = mockRow({ id: 10, active: false });
      const project = mockRow({ id: 50, status: false });
      Team.findOne.mockResolvedValue(team);
      Project.findOne.mockResolvedValue(project);
      MissionCard.findAll.mockResolvedValue([
        mockRow({ status: 'Closed' }),
        mockRow({ status: 'Open' }),
      ]);

      await missionAfterUpdate(
        makeMission({ id: 3, status: 'Open', projMissionId: 50 }, ['status'])
      );

      expect(team.update).toHaveBeenCalledWith({ active: true });
      expect(project.update).toHaveBeenCalledWith({ status: true });
    });

    it('mission afterUpdate catches missing team errors', async () => {
      Team.findOne.mockResolvedValue(null);

      await missionAfterUpdate(
        makeMission({ id: 3, status: 'Open', projMissionId: 50 }, ['status'])
      );

      expect(Team.findOne).toHaveBeenCalledWith({ where: { mission_card_team_id: 3 } });
    });

    it('loads mission detail, latest missions, and all missions', async () => {
      const mission = { id: 1 };
      const latest = [{ id: 2 }];
      const all = [{ id: 3 }];
      MissionCard.findByPk.mockResolvedValue(mission);
      MissionCard.findAll.mockResolvedValueOnce(latest).mockResolvedValueOnce(all);
      const detailRes = mockRes();
      const latestRes = mockRes();
      const allRes = mockRes();

      await missionController.getMissionById({ params: { id: '1' } }, detailRes);
      await missionController.getLatestMission({}, latestRes);
      await missionController.getMission({}, allRes);

      expect(detailRes.json).toHaveBeenCalledWith(mission);
      expect(latestRes.status).toHaveBeenCalledWith(200);
      expect(latestRes.json).toHaveBeenCalledWith(latest);
      expect(allRes.json).toHaveBeenCalledWith(all);
    });

    it('handles mission list and detail error branches', async () => {
      MissionCard.findByPk.mockRejectedValueOnce(new Error('detail failed'));
      MissionCard.findAll
        .mockRejectedValueOnce(new Error('latest failed'))
        .mockResolvedValueOnce([{ id: 8 }])
        .mockRejectedValueOnce(new Error('project failed'))
        .mockRejectedValueOnce(new Error('all failed'));
      const detailRes = mockRes();
      const latestRes = mockRes();
      const projectRes = mockRes();

      await missionController.getMissionById({ params: { id: '1' } }, detailRes);
      await missionController.getLatestMission({}, latestRes);
      await missionController.getMissionsByProjectId({ params: { id: '6' } }, mockRes());
      await missionController.getMissionsByProjectId({ params: { id: '7' } }, projectRes);
      await missionController.getMission({}, mockRes());

      expect(detailRes.status).toHaveBeenCalledWith(500);
      expect(latestRes.status).toHaveBeenCalledWith(404);
      expect(projectRes.status).toHaveBeenCalledWith(500);
    });

    it('rejects empty or partially missing customer assignments and handles add failures', async () => {
      const emptyRes = mockRes();
      await missionController.assignCustomerToMission(
        { params: { missionId: '5' }, body: { customerIds: [] } },
        emptyRes
      );
      expect(emptyRes.status).toHaveBeenCalledWith(400);

      MissionCard.findByPk.mockResolvedValueOnce({ id: 5, addCustomers: jest.fn() });
      Customer.findAll.mockResolvedValueOnce([{ customer_id: 1 }]);
      const missingRes = mockRes();
      await missionController.assignCustomerToMission(
        { params: { missionId: '5' }, body: { customerIds: [1, 2] } },
        missingRes
      );
      expect(missingRes.status).toHaveBeenCalledWith(404);

      MissionCard.findByPk.mockResolvedValueOnce({
        id: 5,
        addCustomers: jest.fn().mockRejectedValue(new Error('join failed')),
      });
      Customer.findAll.mockResolvedValueOnce([{ customer_id: 1 }]);
      const failureRes = mockRes();
      await missionController.assignCustomerToMission(
        { params: { missionId: '5' }, body: { customerIds: [1] } },
        failureRes
      );
      expect(failureRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('teamController handlers and hooks', () => {
    it('returns all teams', async () => {
      const teams = [{ id: 1 }];
      Team.findAll.mockResolvedValue(teams);
      const res = mockRes();

      await teamController.getAllTeams({}, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, teams });
    });

    it('returns teams with users and missions', async () => {
      const teams = [{ id: 1, Profiles: [] }];
      Team.findAll.mockResolvedValue(teams);
      const res = mockRes();

      await teamController.getTeamUsers({}, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, teams });
    });

    it('passes team listing errors to next', async () => {
      const error = new Error('team query failed');
      Team.findAll.mockRejectedValueOnce(error).mockRejectedValueOnce(error);

      await teamController.getAllTeams({}, mockRes(), next);
      await teamController.getTeamUsers({}, mockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledTimes(2);
    });

    it('creates a team and links users that are not already present', async () => {
      Team.findOne.mockResolvedValue(null);
      Team.create.mockResolvedValue({ id: 8 });
      UserProfile.findByPk.mockResolvedValue({ id: 2, total_occupancy: 40 });
      UserTeams.findOne.mockResolvedValue(null);
      const res = mockRes();

      await teamController.createTeam(
        {
          params: { mission_card_id: '4' },
          body: { team_name: 'Alpha', active: true, users: [{ id: 2, active: true }] },
        },
        res,
        next
      );

      expect(Team.create).toHaveBeenCalledWith({
        mission_card_team_id: '4',
        team_name: 'Alpha',
        active: true,
      });
      expect(UserTeams.create).toHaveBeenCalledWith({ profile_id: 2, team_id: 8, active: true });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 400 when creating a team with a maxed out user', async () => {
      Team.findOne.mockResolvedValue({ id: 8 });
      UserProfile.findByPk.mockResolvedValue({ id: 2, total_occupancy: 100 });
      const res = mockRes();

      await teamController.createTeam(
        { params: { mission_card_id: '4' }, body: { users: [{ id: 2 }] } },
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User 2 is at max utilization.',
      });
    });

    it('skips missing users and passes unexpected create errors to next', async () => {
      Team.findOne.mockResolvedValueOnce({ id: 8 });
      UserProfile.findByPk.mockResolvedValueOnce(null);
      const skipRes = mockRes();
      await teamController.createTeam(
        { params: { mission_card_id: '4' }, body: { users: [{ id: 2 }] } },
        skipRes,
        next
      );
      expect(skipRes.status).toHaveBeenCalledWith(201);

      const error = new Error('create failed');
      Team.findOne.mockRejectedValueOnce(error);
      await teamController.createTeam(
        { params: { mission_card_id: '4' }, body: { users: [] } },
        mockRes(),
        next
      );
      expect(next).toHaveBeenCalledWith(error);
    });

    it('gets a team by mission id with associations', async () => {
      const team = { id: 3 };
      Team.findOne.mockResolvedValue(team);
      const res = mockRes();

      await teamController.getTeamById({ params: { id: '9' } }, res, next);

      expect(Team.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { mission_card_team_id: '9' } })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, team });
    });

    it('returns 404 for missing teams and passes getTeamById errors to next', async () => {
      Team.findOne.mockResolvedValueOnce(null);
      const missingRes = mockRes();
      await teamController.getTeamById({ params: { id: '9' } }, missingRes, next);
      expect(missingRes.status).toHaveBeenCalledWith(404);

      const error = new Error('lookup failed');
      Team.findOne.mockRejectedValueOnce(error);
      await teamController.getTeamById({ params: { id: '9' } }, mockRes(), next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('updates team details', async () => {
      const team = { id: 1, update: jest.fn().mockResolvedValue(undefined) };
      Team.findByPk.mockResolvedValue(team);
      const res = mockRes();

      await teamController.updateTeam(
        { params: { id: '1' }, body: { team_name: 'Beta', active: false } },
        res,
        next
      );

      expect(team.update).toHaveBeenCalledWith(
        { team_name: 'Beta', active: false },
        { individualHooks: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 for missing update teams and passes update errors to next', async () => {
      Team.findByPk.mockResolvedValueOnce(null);
      const missingRes = mockRes();
      await teamController.updateTeam({ params: { id: '1' }, body: {} }, missingRes, next);
      expect(missingRes.status).toHaveBeenCalledWith(404);

      const error = new Error('update failed');
      Team.findByPk.mockRejectedValueOnce(error);
      await teamController.updateTeam({ params: { id: '1' }, body: {} }, mockRes(), next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('adds users to a team', async () => {
      Team.findByPk.mockResolvedValue({ id: 5 });
      UserProfile.findByPk.mockResolvedValue({ id: 9, total_occupancy: 25 });
      UserTeams.findOne.mockResolvedValue(null);
      const res = mockRes();

      await teamController.addUsersToTeam(
        { params: { teamId: '5' }, body: { userIds: [9] } },
        res,
        next
      );

      expect(UserTeams.create).toHaveBeenCalledWith({ profile_id: 9, team_id: '5', active: true });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('handles add-users missing team, skipped user, maxed user, duplicate user, and unexpected errors', async () => {
      Team.findByPk.mockResolvedValueOnce(null);
      const missingTeamRes = mockRes();
      await teamController.addUsersToTeam(
        { params: { teamId: '5' }, body: { userIds: [9] } },
        missingTeamRes,
        next
      );
      expect(missingTeamRes.status).toHaveBeenCalledWith(404);

      Team.findByPk.mockResolvedValueOnce({ id: 5 });
      UserProfile.findByPk.mockResolvedValueOnce(null);
      const skippedRes = mockRes();
      await teamController.addUsersToTeam(
        { params: { teamId: '5' }, body: { userIds: [9] } },
        skippedRes,
        next
      );
      expect(skippedRes.status).toHaveBeenCalledWith(200);

      Team.findByPk.mockResolvedValueOnce({ id: 5 });
      UserProfile.findByPk.mockResolvedValueOnce({ id: 9, total_occupancy: 100 });
      const maxedRes = mockRes();
      await teamController.addUsersToTeam(
        { params: { teamId: '5' }, body: { userIds: [9] } },
        maxedRes,
        next
      );
      expect(maxedRes.status).toHaveBeenCalledWith(400);

      Team.findByPk.mockResolvedValueOnce({ id: 5 });
      UserProfile.findByPk.mockResolvedValueOnce({ id: 9, total_occupancy: 10 });
      UserTeams.findOne.mockResolvedValueOnce({ profile_id: 9 });
      const duplicateRes = mockRes();
      await teamController.addUsersToTeam(
        { params: { teamId: '5' }, body: { userIds: [9] } },
        duplicateRes,
        next
      );
      expect(duplicateRes.status).toHaveBeenCalledWith(400);

      const error = new Error('add failed');
      Team.findByPk.mockRejectedValueOnce(error);
      await teamController.addUsersToTeam(
        { params: { teamId: '5' }, body: { userIds: [9] } },
        mockRes(),
        next
      );
      expect(next).toHaveBeenCalledWith(error);
    });

    it('returns 404 when removing a missing user from a team', async () => {
      Team.findByPk.mockResolvedValue({ id: 5 });
      UserProfile.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await teamController.deleteUserFromTeam({ params: { teamId: '5', userId: '9' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'User not found.' });
    });

    it('removes a user from a team and handles missing team and destroy errors', async () => {
      Team.findByPk.mockResolvedValueOnce({ id: 5 });
      UserProfile.findByPk.mockResolvedValueOnce({ id: 9 });
      UserTeams.destroy.mockResolvedValueOnce(1);
      const successRes = mockRes();
      await teamController.deleteUserFromTeam(
        { params: { teamId: '5', userId: '9' } },
        successRes,
        next
      );
      expect(successRes.status).toHaveBeenCalledWith(200);

      Team.findByPk.mockResolvedValueOnce(null);
      const missingTeamRes = mockRes();
      await teamController.deleteUserFromTeam(
        { params: { teamId: '5', userId: '9' } },
        missingTeamRes,
        next
      );
      expect(missingTeamRes.status).toHaveBeenCalledWith(404);

      const error = new Error('delete failed');
      Team.findByPk.mockRejectedValueOnce(error);
      await teamController.deleteUserFromTeam(
        { params: { teamId: '5', userId: '9' } },
        mockRes(),
        next
      );
      expect(next).toHaveBeenCalledWith(error);
    });

    it('deletes several team members', async () => {
      UserTeams.destroy.mockResolvedValue(1);
      const res = mockRes();

      await teamController.deleteTeamMembers(
        { body: { team_id: '5', users: [{ profile_id: '1' }, { profile_id: '2' }] } },
        res,
        next
      );

      expect(UserTeams.destroy).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('passes bulk member delete errors to next', async () => {
      const error = new Error('bulk delete failed');
      UserTeams.destroy.mockRejectedValue(error);

      await teamController.deleteTeamMembers(
        { body: { team_id: '5', users: [{ profile_id: '1' }] } },
        mockRes(),
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('updates user-team occupancy when projected utilization is valid', async () => {
      UserTeams.findOne.mockResolvedValue({ occupancy: 20 });
      UserProfile.findByPk.mockResolvedValue({ total_occupancy: 50 });
      UserTeams.update.mockResolvedValue([1]);
      const res = mockRes();

      await teamController.updateUserTeams(
        { params: { profile_id: '1', team_id: '2' }, body: { occupancy: 40 } },
        res,
        next
      );

      expect(UserTeams.update).toHaveBeenCalledWith(
        { occupancy: 40 },
        { where: { profile_id: '1', team_id: '2' }, individualHooks: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('rejects user-team updates for missing profile, missing membership, or high projection', async () => {
      UserTeams.findOne.mockResolvedValueOnce({ occupancy: 20 });
      UserProfile.findByPk.mockResolvedValueOnce(null);
      const missingProfileRes = mockRes();
      await teamController.updateUserTeams(
        { params: { profile_id: '1', team_id: '2' }, body: { occupancy: 40 } },
        missingProfileRes,
        next
      );
      expect(missingProfileRes.status).toHaveBeenCalledWith(404);

      UserTeams.findOne.mockResolvedValueOnce(null);
      UserProfile.findByPk.mockResolvedValueOnce({ total_occupancy: 50 });
      const missingMembershipRes = mockRes();
      await teamController.updateUserTeams(
        { params: { profile_id: '1', team_id: '2' }, body: { occupancy: 40 } },
        missingMembershipRes,
        next
      );
      expect(missingMembershipRes.status).toHaveBeenCalledWith(404);

      UserTeams.findOne.mockResolvedValueOnce({ occupancy: 20 });
      UserProfile.findByPk.mockResolvedValueOnce({ total_occupancy: 90 });
      const projectedRes = mockRes();
      await teamController.updateUserTeams(
        { params: { profile_id: '1', team_id: '2' }, body: { occupancy: 40 } },
        projectedRes,
        next
      );
      expect(projectedRes.status).toHaveBeenCalledWith(400);
    });

    it('team afterUpdate mirrors active state and recalculates profile occupancy', async () => {
      UserTeams.findAll.mockResolvedValue([
        { profile_id: 1, occupancy: 20 },
        { profile_id: 1, occupancy: 15 },
      ]);
      UserProfile.findByPk.mockResolvedValue({ id: 1, total_occupancy: 50 });

      await teamAfterUpdate({ dataValues: { id: 3, active: true }, changed: () => ['active'] });

      expect(UserTeams.update).toHaveBeenCalledWith({ active: true }, { where: { team_id: 3 } });
      expect(UserProfile.update).toHaveBeenCalledWith(
        { total_occupancy: 85 },
        { where: { id: 1 } }
      );
    });

    it('team afterUpdate returns early without active changes and subtracts occupancy when inactive', async () => {
      await teamAfterUpdate({ dataValues: { id: 3, active: true }, changed: () => ['team_name'] });
      expect(UserTeams.update).not.toHaveBeenCalled();

      UserTeams.findAll.mockResolvedValue([{ profile_id: 1, occupancy: 20 }]);
      UserProfile.findByPk.mockResolvedValue({ id: 1, total_occupancy: 15 });
      await teamAfterUpdate({ dataValues: { id: 3, active: false }, changed: () => ['active'] });

      expect(UserProfile.update).toHaveBeenCalledWith({ total_occupancy: 0 }, { where: { id: 1 } });
    });

    it('team hooks skip inactive saves and missing profiles', async () => {
      await userTeamsAfterSave({
        dataValues: { profile_id: 1, active: false },
        changed: () => ['occupancy'],
      });
      expect(UserProfile.update).not.toHaveBeenCalled();

      UserTeams.findAll.mockResolvedValue([{ profile_id: 1, occupancy: 20 }]);
      UserProfile.findByPk.mockResolvedValueOnce(null);
      await teamAfterUpdate({ dataValues: { id: 3, active: true }, changed: () => ['active'] });

      UserProfile.findByPk.mockResolvedValueOnce(null);
      await userTeamsBeforeDestroy({ dataValues: { profile_id: 1, occupancy: 10 } });

      expect(UserProfile.update).not.toHaveBeenCalled();
    });

    it('user-team hooks refresh occupancy on save and destroy', async () => {
      UserTeams.findAll.mockResolvedValue([
        mockRow({ profile_id: 1, occupancy: 15 }),
        mockRow({ profile_id: 1, occupancy: 25 }),
      ]);
      UserProfile.findByPk.mockResolvedValue({ id: 1, total_occupancy: 60 });

      await userTeamsAfterSave({
        dataValues: { profile_id: 1, active: true },
        changed: () => ['occupancy'],
      });
      await userTeamsBeforeDestroy({ dataValues: { profile_id: 1, occupancy: 10 } });

      expect(UserProfile.update).toHaveBeenCalledWith(
        { total_occupancy: 40 },
        { where: { id: 1 } }
      );
      expect(UserProfile.update).toHaveBeenCalledWith(
        { total_occupancy: 50 },
        { where: { id: 1 } }
      );
    });
  });

  describe('userController handlers and hooks', () => {
    it('hashes passwords in create and update hooks', async () => {
      const newUser = { password: 'plain' };
      const updatingUser = { password: 'changed', changed: () => ['password'] };

      await userBeforeCreate(newUser);
      await userBeforeUpdate(updatingUser);

      expect(newUser.password).toBe('hashed-sync-password');
      expect(updatingUser.password).toBe('hashed-sync-password');
    });

    it('creates an allowed-domain user and returns a DTO', async () => {
      User.create.mockResolvedValue({
        username: 'Alice',
        email: 'alice@tatatechnologies.com',
        user_id: 1,
        user_type: 'Admin',
        burden_rate: 100,
        active: true,
      });
      const res = mockRes();

      await userController.createUser(
        { body: { username: 'Alice', email: 'alice@tatatechnologies.com' } },
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: expect.objectContaining({ email: 'alice@tatatechnologies.com' }),
      });
    });

    it('rejects disallowed user create and update domains', async () => {
      const createRes = mockRes();
      await userController.createUser({ body: { email: 'bad@example.com' } }, createRes, next);
      expect(createRes.status).toHaveBeenCalledWith(400);

      const updateRes = mockRes();
      await userController.updateUser(
        { params: { id: '1' }, body: { email: 'bad@example.com' } },
        updateRes,
        next
      );
      expect(updateRes.status).toHaveBeenCalledWith(400);
    });

    it('updates an allowed-domain user and returns the passwordless record', async () => {
      const updatedUser = { user_id: 1, email: 'new@tatatechnologies.com' };
      User.update.mockResolvedValue([1]);
      User.findOne.mockResolvedValue(updatedUser);
      const res = mockRes();

      await userController.updateUser(
        { params: { id: '1' }, body: { email: 'new@tatatechnologies.com' } },
        res,
        next
      );

      expect(User.update).toHaveBeenCalledWith(
        { email: 'new@tatatechnologies.com' },
        { where: { user_id: '1' }, individualHooks: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: updatedUser });
    });

    it('returns 404 when updateUser changes no rows', async () => {
      User.update.mockResolvedValue([0]);
      const res = mockRes();

      await userController.updateUser(
        { params: { id: '404' }, body: { username: 'Nobody' } },
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('passes user write errors to next', async () => {
      const error = new Error('write failed');
      User.create.mockRejectedValueOnce(error);
      await userController.createUser(
        { body: { email: 'alice@tatatechnologies.com' } },
        mockRes(),
        next
      );
      User.create.mockRejectedValueOnce(error);
      await userController.signUser(
        {
          body: {
            username: 'A',
            email: 'a@tatatechnologies.com',
            password: 'Pass1!',
            user_type: 'Admin',
          },
        },
        mockRes(),
        next
      );
      User.update.mockRejectedValueOnce(error);
      await userController.updateUser(
        { params: { id: '1' }, body: { username: 'A' } },
        mockRes(),
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('signs up a user with a hashed password', async () => {
      const created = { user_id: 3 };
      User.create.mockResolvedValue(created);
      const res = mockRes();

      await userController.signUser(
        {
          body: {
            username: 'Bob',
            email: 'bob@tatatechnologies.com',
            password: 'Pass1!',
            user_type: 'Member',
          },
        },
        res,
        next
      );

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-sync-password' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('rejects password updates when the current password does not match', async () => {
      User.findOne.mockResolvedValue({ user_id: 1, password: 'stored' });
      bcrypt.compare.mockResolvedValue(false);
      const res = mockRes();

      await userController.updatePassword(
        { params: { user_id: '1' }, body: { password: 'Oldpass1!', newPassword: 'Newpass1!' } },
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(User.update).not.toHaveBeenCalled();
    });

    it('covers password validation, missing users, failed updates, and success', async () => {
      const weakRes = mockRes();
      await userController.updatePassword(
        { params: { user_id: '1' }, body: { password: 'Oldpass1!', newPassword: 'weak' } },
        weakRes,
        next
      );
      expect(weakRes.status).toHaveBeenCalledWith(400);

      User.findOne.mockResolvedValueOnce(null);
      const missingRes = mockRes();
      await userController.updatePassword(
        { params: { user_id: '1' }, body: { password: 'Oldpass1!', newPassword: 'Newpass1!' } },
        missingRes,
        next
      );
      expect(missingRes.status).toHaveBeenCalledWith(404);

      User.findOne.mockResolvedValueOnce({ user_id: 1, password: 'stored' });
      bcrypt.compare.mockResolvedValueOnce(true);
      User.update.mockResolvedValueOnce([0]);
      const failedRes = mockRes();
      await userController.updatePassword(
        { params: { user_id: '1' }, body: { password: 'Oldpass1!', newPassword: 'Newpass1!' } },
        failedRes,
        next
      );
      expect(failedRes.status).toHaveBeenCalledWith(404);

      User.findOne.mockResolvedValueOnce({ user_id: 1, password: 'stored' });
      bcrypt.compare.mockResolvedValueOnce(true);
      User.update.mockResolvedValueOnce([1]);
      const successRes = mockRes();
      await userController.updatePassword(
        { params: { user_id: '1' }, body: { password: 'Oldpass1!', newPassword: 'Newpass1!' } },
        successRes,
        next
      );
      expect(successRes.status).toHaveBeenCalledWith(200);
    });

    it('gets a user by id and returns 404 when absent', async () => {
      const user = { user_id: 1 };
      User.findOne.mockResolvedValueOnce(user).mockResolvedValueOnce(null);
      const foundRes = mockRes();
      const missingRes = mockRes();

      await userController.getUserById({ params: { id: '1' } }, foundRes, next);
      await userController.getUserById({ params: { id: '2' } }, missingRes, next);

      expect(foundRes.status).toHaveBeenCalledWith(200);
      expect(missingRes.status).toHaveBeenCalledWith(404);
    });

    it('passes read errors to next', async () => {
      const error = new Error('read failed');
      User.findOne.mockRejectedValueOnce(error);
      await userController.getUserById({ params: { id: '1' } }, mockRes(), next);
      User.findAll.mockRejectedValueOnce(error);
      await userController.getUsers({}, mockRes(), next);
      User.findAll.mockRejectedValueOnce(error);
      await userController.getUserDetails({}, mockRes(), next);
      MissionCard.findAll.mockRejectedValueOnce(error);
      await userController.getMissionDetails({ query: { leader: '7' } }, mockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('returns public DTOs for users and strips burden rate from details', async () => {
      User.findAll.mockResolvedValue([
        {
          username: 'Alice',
          email: 'alice@tatatechnologies.com',
          user_id: 1,
          user_type: 'Admin',
          burden_rate: 123,
          active: true,
        },
      ]);
      const usersRes = mockRes();
      const detailsRes = mockRes();

      await userController.getUsers({}, usersRes, next);
      await userController.getUserDetails({}, detailsRes, next);

      expect(usersRes.json).toHaveBeenCalledWith({
        success: true,
        users: [expect.objectContaining({ burden_rate: 123 })],
      });
      expect(detailsRes.json).toHaveBeenCalledWith({
        success: true,
        users: [expect.not.objectContaining({ burden_rate: expect.anything() })],
      });
    });

    it('requires a leader query before loading mission details', async () => {
      const res = mockRes();

      await userController.getMissionDetails({ query: {} }, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(MissionCard.findAll).not.toHaveBeenCalled();
    });

    it('returns mission details for a leader', async () => {
      const missions = [{ id: 2 }];
      MissionCard.findAll.mockResolvedValue(missions);
      const res = mockRes();

      await userController.getMissionDetails({ query: { leader: '7' } }, res, next);

      expect(MissionCard.findAll).toHaveBeenCalledWith({
        where: { missionCardLeader: '7' },
        include: [{ model: PurchaseOrder, as: 'projectPo' }],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, missions });
    });

    it('returns 404 when a leader has no mission details', async () => {
      MissionCard.findAll.mockResolvedValue([]);
      const res = mockRes();

      await userController.getMissionDetails({ query: { leader: '7' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
