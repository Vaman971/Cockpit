/**
 * Unit tests — opportunityController
 * Covers: getOpportunity, getOpportunityById, createOpportunity, updateOpportunity, getLatestOpportunities
 */
const { mockRow } = require('./helpers/modelMock');

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../models/opportunityModel', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  afterUpdate: jest.fn(),
  afterCreate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/userModel', () => ({
  findOne: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
}));
jest.mock('../models/projectModel', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));

const Opportunity = require('../models/opportunityModel');
const {
  getOpportunity,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  getLatestOpportunities,
} = require('../controllers/opportunityController');

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next = jest.fn();

const sampleOppo = mockRow({ id: 1, OpDescription: 'Test Oppo', status: 'Active', cluster: 'EU' });

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('opportunityController — getOpportunity', () => {
  it('returns 200 with all opportunities', async () => {
    Opportunity.findAll.mockResolvedValue([sampleOppo]);
    const res = mockRes();
    await getOpportunity({}, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('calls next(error) on DB failure', async () => {
    Opportunity.findAll.mockRejectedValue(new Error('DB error'));
    await getOpportunity({}, mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('opportunityController — getOpportunityById', () => {
  it('returns 200 when found', async () => {
    Opportunity.findOne.mockResolvedValue(sampleOppo);
    const res = mockRes();
    await getOpportunityById({ params: { id: '1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when not found', async () => {
    Opportunity.findOne.mockResolvedValue(null);
    const res = mockRes();
    await getOpportunityById({ params: { id: '999' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('opportunityController — createOpportunity', () => {
  it('returns 201 on success', async () => {
    Opportunity.create.mockResolvedValue(sampleOppo);
    const res = mockRes();
    await createOpportunity({ body: { OpDescription: 'New Oppo' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

describe('opportunityController — updateOpportunity', () => {
  it('returns 200 when rows affected', async () => {
    Opportunity.update.mockResolvedValue([1]);
    Opportunity.findByPk.mockResolvedValue(sampleOppo);
    const res = mockRes();
    await updateOpportunity({ params: { id: '1' }, body: { status: 'Won' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when no rows updated', async () => {
    Opportunity.update.mockResolvedValue([0]);
    const res = mockRes();
    await updateOpportunity({ params: { id: '999' }, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('opportunityController — getLatestOpportunities', () => {
  it('returns 200 with limited results', async () => {
    Opportunity.findAll.mockResolvedValue([sampleOppo]);
    const res = mockRes();
    await getLatestOpportunities({}, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
