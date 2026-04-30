/**
 * Unit tests — poController
 * Covers: getAllPOs, getPOById, createPO, updatePO
 */
const { mockRow } = require('./helpers/modelMock');

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../models/poModel', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
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
  update: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeCreate: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/invoiceModel', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  sum: jest.fn(),
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

const PO = require('../models/poModel');
const { createPo, getPo, getPoById, updatePo } = require('../controllers/poController');

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next = jest.fn();

const samplePO = mockRow({ id: 1, poNumber: 'PO-001', poAmount: 10000, poStatus: 'open' });

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('poController — getPo (getAllPOs)', () => {
  it('returns 200 with all POs', async () => {
    PO.findAll.mockResolvedValue([samplePO]);
    const res = mockRes();
    await getPo({}, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('calls next(error) on DB failure', async () => {
    PO.findAll.mockRejectedValue(new Error('DB error'));
    await getPo({}, mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('poController — getPoById', () => {
  it('returns 200 when PO found', async () => {
    PO.findByPk.mockResolvedValue(samplePO);
    const res = mockRes();
    await getPoById({ params: { id: '1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when PO not found', async () => {
    PO.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getPoById({ params: { id: '999' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('poController — createPo', () => {
  it('returns 201 on successful PO creation', async () => {
    PO.create.mockResolvedValue(samplePO);
    const res = mockRes();
    await createPo({ body: { poNumber: 'PO-002', poAmount: 5000 } }, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('calls next(error) on DB failure', async () => {
    PO.create.mockRejectedValue(new Error('DB error'));
    await createPo({ body: {} }, mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('poController — updatePo', () => {
  it('returns 200 on successful update', async () => {
    PO.update.mockResolvedValue([1]);
    const res = mockRes();
    await updatePo({ params: { id: '1' }, body: { poStatus: 'closed' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when no rows updated', async () => {
    PO.update.mockResolvedValue([0]);
    const res = mockRes();
    await updatePo({ params: { id: '999' }, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
