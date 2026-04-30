/**
 * Unit tests — profileController
 * Covers: getProfile, getAllProfile, getProfiles, updateProfile
 */
const { mockRow } = require('./helpers/modelMock');

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../models/profileModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/userModel', () => ({
  findOne: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
}));
jest.mock('../models/UserTeams', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/TeamModel', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
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

const UserProfile = require('../models/profileModel');
const {
  getProfile,
  getAllProfile,
  getProfiles,
  updateProfile,
} = require('../controllers/profileController');

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next = jest.fn();

const sampleProfile = mockRow({
  id: 1,
  username: 'alice',
  email: 'alice@test.com',
  profileImage: null,
  total_occupancy: 0,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('profileController — getProfile', () => {
  it('returns 200 with profile data', async () => {
    UserProfile.findOne.mockResolvedValue(sampleProfile);
    const res = mockRes();
    await getProfile({ params: { username: 'alice' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 404 when profile not found', async () => {
    UserProfile.findOne.mockResolvedValue(null);
    const res = mockRes();
    await getProfile({ params: { username: 'nobody' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('calls next(error) on DB failure', async () => {
    UserProfile.findOne.mockRejectedValue(new Error('DB error'));
    await getProfile({ params: { username: 'alice' } }, mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('profileController — getAllProfile', () => {
  it('returns 400 when username query is missing', async () => {
    const res = mockRes();
    await getAllProfile({ query: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when no matching profiles', async () => {
    UserProfile.findAll.mockResolvedValue([]);
    const res = mockRes();
    await getAllProfile({ query: { username: 'xyz' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 with matching profiles', async () => {
    UserProfile.findAll.mockResolvedValue([sampleProfile]);
    const res = mockRes();
    await getAllProfile({ query: { username: 'alice' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

describe('profileController — getProfiles', () => {
  it('returns 200 with all profiles', async () => {
    UserProfile.findAll.mockResolvedValue([sampleProfile]);
    const res = mockRes();
    await getProfiles({}, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('profileController — updateProfile', () => {
  it('returns 200 on successful update', async () => {
    UserProfile.update.mockResolvedValue([1]);
    UserProfile.findOne.mockResolvedValue(sampleProfile);
    const res = mockRes();
    await updateProfile(
      { params: { username: 'alice' }, body: { bio: 'Dev' }, file: null },
      res,
      next
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when no rows updated', async () => {
    UserProfile.update.mockResolvedValue([0]);
    const res = mockRes();
    await updateProfile({ params: { username: 'nobody' }, body: {}, file: null }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
