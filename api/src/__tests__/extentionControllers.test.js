jest.mock('../models/extentionInvoice', () => ({
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  sum: jest.fn(),
  update: jest.fn(),
}));

jest.mock('../models/extentionModel', () => ({
  afterUpdate: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
}));

jest.mock('../models/missionModel', () => ({ findAll: jest.fn() }));
jest.mock('../models/projectModel', () => ({ findByPk: jest.fn() }));
jest.mock('../models/userModel', () => ({}));
jest.mock('../utils/logger', () => ({ error: jest.fn() }));

const { Op } = require('sequelize');
const ExtentionInvoice = require('../models/extentionInvoice');
const ExtentionModel = require('../models/extentionModel');
const MissionCard = require('../models/missionModel');
const Project = require('../models/projectModel');
const logger = require('../utils/logger');
const extentionController = require('../controllers/extentionController');
const extentionInvoiceController = require('../controllers/extentionInvoiceController');

const extentionAfterUpdateHook = ExtentionModel.afterUpdate.mock.calls[0][0];
const extentionInvoiceAfterSaveHook = ExtentionInvoice.afterSave.mock.calls[0][0];
const extentionInvoiceBeforeDestroyHook = ExtentionInvoice.beforeDestroy.mock.calls[0][0];

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const projectRow = (data = {}) => ({
  dataValues: {
    id: 4,
    cluster: 'Aerospace',
    region: 'APAC',
    siglum: 'SIG',
    project_title: 'Legacy project',
    ...data,
  },
});

const missionRow = (start, end) => ({
  dataValues: {
    missionStartDate: start,
    missionEndDate: end,
  },
});

describe('legacy extentionController', () => {
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers an afterUpdate hook that cascades currency to extention invoices', async () => {
    const invoice = { update: jest.fn().mockResolvedValue(undefined) };
    ExtentionInvoice.findAll.mockResolvedValue([invoice]);

    await extentionAfterUpdateHook({
      dataValues: { id: 12, currencyCode: 'USD' },
    });

    expect(ExtentionInvoice.findAll).toHaveBeenCalledWith({ where: { extentionId: 12 } });
    expect(invoice.update).toHaveBeenCalledWith({ currencyCode: 'USD' });
  });

  it('logs afterUpdate hook failures without throwing', async () => {
    const error = new Error('hook failed');
    ExtentionInvoice.findAll.mockRejectedValue(error);

    await extentionAfterUpdateHook({
      dataValues: { id: 12, currencyCode: 'USD' },
    });

    expect(logger.error).toHaveBeenCalledWith('ExtentionModel afterUpdate hook error:', error);
  });

  it('creates an extention with project fields and mission date range', async () => {
    const created = { id: 5 };
    Project.findByPk.mockResolvedValue(projectRow());
    MissionCard.findAll.mockResolvedValue([
      missionRow('2026-03-01', '2026-03-31'),
      missionRow('2026-04-01', '2026-05-15'),
    ]);
    ExtentionModel.create.mockResolvedValue(created);

    const req = { body: { extentionProjectId: 4 } };
    const res = makeRes();
    await extentionController.createExtention(req, res, jest.fn());

    expect(ExtentionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        extentionProjectId: 4,
        cluster: 'Aerospace',
        region: 'APAC',
        siglum: 'SIG',
        description: 'Legacy project',
        extentionStartDate: new Date('2026-03-01'),
        extentionEndDate: new Date('2026-05-15'),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, extension: created });
  });

  it('passes create errors to next', async () => {
    Project.findByPk.mockResolvedValue(null);
    const next = jest.fn();

    await extentionController.createExtention(
      { body: { extentionProjectId: 99 } },
      makeRes(),
      next
    );

    expect(logger.error).toHaveBeenCalledWith('createExtention error:', expect.any(TypeError));
    expect(next.mock.calls[0][0]).toBeInstanceOf(TypeError);
  });

  it('gets all extentions and returns 500 on read failures', async () => {
    ExtentionModel.findAll.mockResolvedValue([{ id: 1 }]);
    const res = makeRes();
    await extentionController.getExtention({}, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);

    ExtentionModel.findAll.mockRejectedValue(new Error('db down'));
    const errorRes = makeRes();
    await extentionController.getExtention({}, errorRes);
    expect(errorRes.status).toHaveBeenCalledWith(500);
    expect(errorRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('gets, misses, and updates extention records', async () => {
    ExtentionModel.findByPk.mockResolvedValueOnce({ id: 2 }).mockResolvedValueOnce(null);

    const foundRes = makeRes();
    await extentionController.getExtentionById({ params: { id: '2' } }, foundRes);
    expect(foundRes.json).toHaveBeenCalledWith({ id: 2 });

    const missingRes = makeRes();
    await extentionController.getExtentionById({ params: { id: '404' } }, missingRes);
    expect(missingRes.status).toHaveBeenCalledWith(404);
    expect(missingRes.json).toHaveBeenCalledWith({ error: 'Extention not found' });

    ExtentionModel.update.mockResolvedValue([1]);
    const updateRes = makeRes();
    await extentionController.updateExtention(
      { params: { id: '2' }, body: { status: true } },
      updateRes
    );
    expect(ExtentionModel.update).toHaveBeenCalledWith(
      { status: true },
      { where: { id: '2' }, individualHooks: true }
    );
    expect(updateRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'Extention updated successfully',
    });

    ExtentionModel.update.mockResolvedValue([0]);
    const noChangeRes = makeRes();
    await extentionController.updateExtention(
      { params: { id: '2' }, body: { status: true } },
      noChangeRes
    );
    expect(noChangeRes.status).toHaveBeenCalledWith(404);
  });

  it('updates project-derived fields when the extention project changes', async () => {
    Project.findByPk.mockResolvedValue(projectRow({ id: 8, cluster: 'Defense' }));
    MissionCard.findAll.mockResolvedValue([missionRow('2026-01-01', '2026-02-01')]);
    ExtentionModel.update.mockResolvedValue([1]);

    const res = makeRes();
    await extentionController.updateExtention(
      { params: { id: '6' }, body: { extentionProjectId: 8 } },
      res
    );

    expect(ExtentionModel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster: 'Defense',
        extentionStartDate: new Date('2026-01-01'),
        extentionEndDate: new Date('2026-02-01'),
      }),
      { where: { id: '6' }, individualHooks: true }
    );
  });

  it('gets invoices for one extention', async () => {
    ExtentionInvoice.findAll.mockResolvedValue([{ id: 1 }]);

    const res = makeRes();
    await extentionController.getExtentionInvoices({ params: { id: '6' } }, res);

    expect(ExtentionInvoice.findAll).toHaveBeenCalledWith({ where: { extentionId: '6' } });
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });
});

describe('legacy extentionInvoiceController', () => {
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers hooks that roll invoice totals into the parent extention', async () => {
    const extention = {
      currencyCode: 'GBP',
      update: jest.fn().mockResolvedValue(undefined),
    };
    ExtentionInvoice.sum.mockResolvedValueOnce(50).mockResolvedValueOnce(80);
    ExtentionModel.findByPk.mockResolvedValue(extention);

    await extentionInvoiceAfterSaveHook({ extentionId: 6 });

    expect(extention.update).toHaveBeenCalledWith(
      { revenueProjection: 80, actualRevenue: 50 },
      { hooks: false }
    );
    expect(ExtentionInvoice.update).toHaveBeenCalledWith(
      { currencyCode: 'GBP' },
      { where: { extentionId: 6 } }
    );

    extention.revenueProjection = 80;
    extention.actualRevenue = 50;
    await extentionInvoiceBeforeDestroyHook({
      extentionId: 6,
      revenueProjection: 25,
      actualRevenue: 60,
    });

    expect(extention.update).toHaveBeenLastCalledWith(
      { revenueProjection: 55, actualRevenue: 0 },
      { hooks: false }
    );
  });

  it('creates placeholder, merged, and new dated extention invoices', async () => {
    ExtentionInvoice.create.mockResolvedValueOnce({ id: 1 });
    const placeholderRes = makeRes();
    await extentionInvoiceController.createExtentionInvoice(
      { params: { extentionId: '6' }, body: { revenueProjection: 0, invoiceDate: '' } },
      placeholderRes
    );
    expect(placeholderRes.status).toHaveBeenCalledWith(200);
    expect(ExtentionInvoice.create).toHaveBeenCalledWith({
      extentionId: '6',
      revenueProjection: 0,
      invoiceDate: null,
    });

    const existingInvoice = {
      actualRevenue: '10',
      revenueProjection: '20',
      save: jest.fn().mockResolvedValue(undefined),
    };
    ExtentionInvoice.findOne.mockResolvedValueOnce(existingInvoice);
    const mergeRes = makeRes();
    await extentionInvoiceController.createExtentionInvoice(
      {
        params: { extentionId: '6' },
        body: { actualRevenue: 5, revenueProjection: 15, invoiceDate: '2026-05-10' },
      },
      mergeRes
    );
    expect(existingInvoice.actualRevenue).toBe(15);
    expect(existingInvoice.revenueProjection).toBe(35);
    expect(existingInvoice.save).toHaveBeenCalled();

    ExtentionInvoice.findOne.mockResolvedValueOnce(null);
    ExtentionInvoice.create.mockResolvedValueOnce({ id: 2 });
    const createRes = makeRes();
    await extentionInvoiceController.createExtentionInvoice(
      {
        params: { extentionId: '6' },
        body: { actualRevenue: 5, revenueProjection: 15, invoiceDate: '2026-06-10' },
      },
      createRes
    );
    expect(ExtentionInvoice.create).toHaveBeenLastCalledWith({
      extentionId: '6',
      actualRevenue: 5,
      revenueProjection: 15,
      invoiceDate: new Date('2026-06-10'),
    });
    expect(createRes.status).toHaveBeenCalledWith(200);
  });

  it('returns 500 when creating an extention invoice fails', async () => {
    ExtentionInvoice.findOne.mockRejectedValue(new Error('bad date query'));

    const res = makeRes();
    await extentionInvoiceController.createExtentionInvoice(
      {
        params: { extentionId: '6' },
        body: { actualRevenue: 1, revenueProjection: 2, invoiceDate: '2026-05-10' },
      },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'bad date query' });
  });

  it('reads extention invoices globally, by id, and by extention id', async () => {
    ExtentionInvoice.findAll.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([{ id: 3 }]);
    ExtentionInvoice.findByPk.mockResolvedValue({ id: 2 });

    const allRes = makeRes();
    await extentionInvoiceController.getExtentionInvoices({}, allRes);
    expect(allRes.status).toHaveBeenCalledWith(200);
    expect(allRes.json).toHaveBeenCalledWith([{ id: 1 }]);

    const byIdRes = makeRes();
    await extentionInvoiceController.getExtentionInvoiceById({ params: { id: '2' } }, byIdRes);
    expect(byIdRes.json).toHaveBeenCalledWith({ id: 2 });

    const byExtentionRes = makeRes();
    await extentionInvoiceController.getExtentionInvoicesByExtentionId(
      { params: { id: '6' } },
      byExtentionRes
    );
    expect(byExtentionRes.status).toHaveBeenCalledWith(200);
    expect(byExtentionRes.json).toHaveBeenCalledWith([{ id: 3 }]);
  });

  it('returns 404 for missing extention invoice lookups', async () => {
    ExtentionInvoice.findByPk.mockResolvedValue(null);
    const byIdRes = makeRes();
    await extentionInvoiceController.getExtentionInvoiceById({ params: { id: '404' } }, byIdRes);
    expect(byIdRes.status).toHaveBeenCalledWith(404);

    ExtentionInvoice.findAll.mockResolvedValue([]);
    const byExtentionRes = makeRes();
    await extentionInvoiceController.getExtentionInvoicesByExtentionId(
      { params: { id: '6' } },
      byExtentionRes
    );
    expect(byExtentionRes.status).toHaveBeenCalledWith(404);
  });

  it('updates an extention invoice and destroys a duplicate in the target month', async () => {
    const currentInvoice = { extentionId: '6' };
    const duplicate = { destroy: jest.fn().mockResolvedValue(undefined) };
    const updatedInvoice = {
      revenueProjection: 10,
      actualRevenue: 20,
      invoiceDate: new Date('2026-01-01'),
      save: jest.fn().mockResolvedValue(undefined),
    };
    ExtentionInvoice.findByPk
      .mockResolvedValueOnce(currentInvoice)
      .mockResolvedValueOnce(updatedInvoice);
    ExtentionInvoice.findOne.mockResolvedValue(duplicate);

    const res = makeRes();
    await extentionInvoiceController.updateExtentionInvoiceById(
      { params: { id: '9' }, body: { revenueProjection: 30, invoiceDate: '2026-07-10' } },
      res
    );

    expect(ExtentionInvoice.findOne).toHaveBeenCalledWith({
      where: {
        id: { [Op.not]: '9', extentionId: '6' },
        invoiceDate: { [Op.between]: ['2026-07-01', '2026-07-30'] },
      },
    });
    expect(duplicate.destroy).toHaveBeenCalled();
    expect(updatedInvoice.revenueProjection).toBe(30);
    expect(updatedInvoice.actualRevenue).toBe(20);
    expect(updatedInvoice.invoiceDate).toEqual(new Date('2026-07-10'));
    expect(updatedInvoice.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('validates empty update input', async () => {
    const res = makeRes();
    await extentionInvoiceController.updateExtentionInvoiceById(
      { params: { id: '9' }, body: {} },
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No input from User' });
  });

  it('deletes an extention invoice or returns 404 when it does not exist', async () => {
    ExtentionInvoice.findByPk.mockResolvedValueOnce(null);
    const missingRes = makeRes();
    await extentionInvoiceController.deleteExtentionInvoiceById(
      { params: { id: '9' } },
      missingRes
    );
    expect(missingRes.status).toHaveBeenCalledWith(404);

    const invoice = { destroy: jest.fn().mockResolvedValue(undefined) };
    ExtentionInvoice.findByPk.mockResolvedValueOnce(invoice);
    const deletedRes = makeRes();
    await extentionInvoiceController.deleteExtentionInvoiceById(
      { params: { id: '9' } },
      deletedRes
    );
    expect(invoice.destroy).toHaveBeenCalled();
    expect(deletedRes.status).toHaveBeenCalledWith(200);
    expect(deletedRes.json).toHaveBeenCalledWith({
      message: 'Extention invoice deleted successfully',
    });
  });
});
