/**
 * Unit tests — projectController
 * Covers: getProject, getProjectById, updateProject, deleteProject, getProjectByOpportunityId
 */
const { mockRow } = require('./helpers/modelMock');

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../models/projectModel', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/opportunityModel', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/missionModel', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeCreate: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/userModel', () => ({
  findOne: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
}));

const Project = require('../models/projectModel');
const {
  getProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectByOpportunityId,
} = require('../controllers/projectController');

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next = jest.fn();

const sampleProject = mockRow({
  id: 1,
  project_title: 'Test Project',
  status: 'active',
  oppurtunity_id: 10,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('projectController — getProject', () => {
  it('returns 200 with all projects', async () => {
    Project.findAll.mockResolvedValue([sampleProject]);
    const res = mockRes();
    await getProject({ query: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('calls next(error) on DB failure', async () => {
    Project.findAll.mockRejectedValue(new Error('DB error'));
    await getProject({ query: {} }, mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('projectController — getProjectById', () => {
  it('returns 200 when project exists', async () => {
    Project.findOne.mockResolvedValue(sampleProject);
    const res = mockRes();
    await getProjectById({ params: { id: '1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 404 when project does not exist', async () => {
    Project.findOne.mockResolvedValue(null);
    const res = mockRes();
    await getProjectById({ params: { id: '999' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

describe('projectController — updateProject', () => {
  it('returns 200 on successful update', async () => {
    Project.update.mockResolvedValue([1]);
    Project.findByPk.mockResolvedValue(sampleProject);
    const res = mockRes();
    await updateProject({ params: { id: '1' }, body: { status: 'closed' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when no rows updated', async () => {
    Project.update.mockResolvedValue([0]);
    const res = mockRes();
    await updateProject({ params: { id: '999' }, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('projectController — deleteProject (soft delete)', () => {
  it('returns 200 when project is deactivated', async () => {
    Project.findOne.mockResolvedValue(sampleProject);
    Project.update.mockResolvedValue([1]);
    const res = mockRes();
    await deleteProject({ params: { id: '10' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 404 when project not found for deletion', async () => {
    Project.findOne.mockResolvedValue(null);
    const res = mockRes();
    await deleteProject({ params: { id: '999' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('projectController — getProjectByOpportunityId', () => {
  it('returns 200 with matching projects', async () => {
    Project.findAll.mockResolvedValue([sampleProject]);
    const res = mockRes();
    await getProjectByOpportunityId({ params: { oppurtunity_id: '10' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when no projects found', async () => {
    Project.findAll.mockResolvedValue([]);
    const res = mockRes();
    await getProjectByOpportunityId({ params: { oppurtunity_id: '999' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
