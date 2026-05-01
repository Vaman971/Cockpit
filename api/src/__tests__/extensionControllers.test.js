jest.mock('../models/extensionInvoice', () => ({
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  sum: jest.fn(),
  update: jest.fn(),
}));

jest.mock('../models/extensionModel', () => ({
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
const ExtensionInvoice = require('../models/extensionInvoice');
const ExtensionModel = require('../models/extensionModel');
const MissionCard = require('../models/missionModel');
const Project = require('../models/projectModel');
const logger = require('../utils/logger');
const extensionController = require('../controllers/extensionController');
const extensionInvoiceController = require('../controllers/extensionInvoiceController');

const extensionAfterUpdateHook = ExtensionModel.afterUpdate.mock.calls[0][0];
const extensionInvoiceAfterSaveHook = ExtensionInvoice.afterSave.mock.calls[0][0];
const extensionInvoiceBeforeDestroyHook = ExtensionInvoice.beforeDestroy.mock.calls[0][0];

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const projectRow = (data = {}) => ({
  dataValues: {
    id: 7,
    cluster: 'Aerospace',
    region: 'APAC',
    siglum: 'SIG',
    project_title: 'Project title',
    ...data,
  },
});

const missionRow = (start, end) => ({
  dataValues: {
    missionStartDate: start,
    missionEndDate: end,
  },
});

describe('extensionController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers an afterUpdate hook that cascades currency to extension invoices', async () => {
    const invoice = { update: jest.fn().mockResolvedValue(undefined) };
    ExtensionInvoice.findAll.mockResolvedValue([invoice]);

    await extensionAfterUpdateHook({ dataValues: { id: 42, currencyCode: 'USD' } });

    expect(ExtensionInvoice.findAll).toHaveBeenCalledWith({ where: { extensionId: 42 } });
    expect(invoice.update).toHaveBeenCalledWith({ currencyCode: 'USD' });
  });

  it('logs afterUpdate hook failures without throwing', async () => {
    const error = new Error('hook failed');
    ExtensionInvoice.findAll.mockRejectedValue(error);

    await extensionAfterUpdateHook({ dataValues: { id: 42, currencyCode: 'USD' } });

    expect(logger.error).toHaveBeenCalledWith('ExtensionModel afterUpdate hook error:', error);
  });

  it('creates an extension with project fields and mission date range', async () => {
    const created = { id: 11 };
    Project.findByPk.mockResolvedValue(projectRow());
    MissionCard.findAll.mockResolvedValue([
      missionRow('2026-03-01', '2026-03-31'),
      missionRow('2026-04-01', '2026-05-15'),
    ]);
    ExtensionModel.create.mockResolvedValue(created);

    const req = { body: { extensionProjectId: 7, currencyCode: 'EUR' } };
    const res = makeRes();
    await extensionController.createExtension(req, res, jest.fn());

    expect(ExtensionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        extensionProjectId: 7,
        cluster: 'Aerospace',
        region: 'APAC',
        siglum: 'SIG',
        description: 'Project title',
        extensionStartDate: new Date('2026-03-01'),
        extensionEndDate: new Date('2026-05-15'),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, extension: created });
  });

  it('returns 404 when creating for an unknown project', async () => {
    Project.findByPk.mockResolvedValue(null);

    const res = makeRes();
    await extensionController.createExtension({ body: { extensionProjectId: 99 } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Project not found.' });
    expect(ExtensionModel.create).not.toHaveBeenCalled();
  });

  it('passes create errors to next', async () => {
    const error = new Error('db down');
    Project.findByPk.mockRejectedValue(error);
    const next = jest.fn();

    await extensionController.createExtension({ body: { extensionProjectId: 7 } }, makeRes(), next);

    expect(logger.error).toHaveBeenCalledWith('createExtension error:', error);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('gets extensions and individual extension records with includes', async () => {
    const extensions = [{ id: 1 }];
    ExtensionModel.findAll.mockResolvedValue(extensions);
    ExtensionModel.findByPk.mockResolvedValue({ id: 3 });

    const listRes = makeRes();
    await extensionController.getExtensions({}, listRes, jest.fn());

    expect(ExtensionModel.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ order: [['created_at', 'DESC']] })
    );
    expect(listRes.status).toHaveBeenCalledWith(200);
    expect(listRes.json).toHaveBeenCalledWith({ success: true, extensions });

    const idRes = makeRes();
    await extensionController.getExtensionById({ params: { id: '3' } }, idRes, jest.fn());

    expect(ExtensionModel.findByPk).toHaveBeenCalledWith(
      '3',
      expect.objectContaining({ include: expect.any(Array) })
    );
    expect(idRes.json).toHaveBeenCalledWith({ success: true, extension: { id: 3 } });
  });

  it('returns 404 for a missing extension by id', async () => {
    ExtensionModel.findByPk.mockResolvedValue(null);

    const res = makeRes();
    await extensionController.getExtensionById({ params: { id: '404' } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Extension not found.' });
  });

  it('updates an extension and recalculates project-derived fields when project changes', async () => {
    Project.findByPk.mockResolvedValue(projectRow({ id: 8, cluster: 'Defense' }));
    MissionCard.findAll.mockResolvedValue([missionRow('2026-01-01', '2026-02-01')]);
    ExtensionModel.update.mockResolvedValue([1]);

    const req = { params: { id: '5' }, body: { extensionProjectId: 8 } };
    const res = makeRes();
    await extensionController.updateExtension(req, res, jest.fn());

    expect(ExtensionModel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        extensionProjectId: 8,
        cluster: 'Defense',
        extensionStartDate: new Date('2026-01-01'),
        extensionEndDate: new Date('2026-02-01'),
      }),
      { where: { id: '5' }, individualHooks: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Extension updated successfully.',
    });
  });

  it('returns 404 when update affects no rows or references an unknown project', async () => {
    ExtensionModel.update.mockResolvedValue([0]);
    const noRowsRes = makeRes();
    await extensionController.updateExtension(
      { params: { id: '5' }, body: { status: true } },
      noRowsRes,
      jest.fn()
    );
    expect(noRowsRes.status).toHaveBeenCalledWith(404);

    Project.findByPk.mockResolvedValue(null);
    const missingProjectRes = makeRes();
    await extensionController.updateExtension(
      { params: { id: '5' }, body: { extensionProjectId: 77 } },
      missingProjectRes,
      jest.fn()
    );
    expect(missingProjectRes.status).toHaveBeenCalledWith(404);
    expect(missingProjectRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Project not found.',
    });
  });

  it('gets invoices for one extension', async () => {
    const invoices = [{ id: 1 }];
    ExtensionInvoice.findAll.mockResolvedValue(invoices);

    const res = makeRes();
    await extensionController.getExtensionInvoices({ params: { id: '9' } }, res, jest.fn());

    expect(ExtensionInvoice.findAll).toHaveBeenCalledWith({ where: { extensionId: '9' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, invoices });
  });
});

describe('extensionInvoiceController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers hooks that roll invoice totals into the parent extension', async () => {
    const extension = {
      currencyCode: 'GBP',
      update: jest.fn().mockResolvedValue(undefined),
    };
    ExtensionInvoice.sum.mockResolvedValueOnce(120).mockResolvedValueOnce(300);
    ExtensionModel.findByPk.mockResolvedValue(extension);

    await extensionInvoiceAfterSaveHook({ extensionId: 4 });

    expect(extension.update).toHaveBeenCalledWith(
      { revenueProjection: 300, actualRevenue: 120 },
      { hooks: false }
    );
    expect(ExtensionInvoice.update).toHaveBeenCalledWith(
      { currencyCode: 'GBP' },
      { where: { extensionId: 4 } }
    );

    extension.revenueProjection = 300;
    extension.actualRevenue = 120;
    await extensionInvoiceBeforeDestroyHook({
      extensionId: 4,
      revenueProjection: 350,
      actualRevenue: 20,
    });

    expect(extension.update).toHaveBeenLastCalledWith(
      { revenueProjection: 0, actualRevenue: 100 },
      { hooks: false }
    );
  });

  it('creates a zero-value placeholder invoice', async () => {
    const invoice = { id: 1 };
    ExtensionInvoice.create.mockResolvedValue(invoice);

    const res = makeRes();
    await extensionInvoiceController.createExtensionInvoice(
      { params: { extensionId: '6' }, body: { revenueProjection: 0, invoiceDate: '' } },
      res,
      jest.fn()
    );

    expect(ExtensionInvoice.create).toHaveBeenCalledWith({
      extensionId: '6',
      revenueProjection: 0,
      invoiceDate: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, invoice });
  });

  it('merges revenue into an existing invoice for the same month', async () => {
    const existing = {
      actualRevenue: '10',
      revenueProjection: '20',
      save: jest.fn().mockResolvedValue(undefined),
    };
    ExtensionInvoice.findOne.mockResolvedValue(existing);

    const res = makeRes();
    await extensionInvoiceController.createExtensionInvoice(
      {
        params: { extensionId: '6' },
        body: { actualRevenue: 5, revenueProjection: 15, invoiceDate: '2026-05-10' },
      },
      res,
      jest.fn()
    );

    expect(ExtensionInvoice.findOne).toHaveBeenCalledWith({
      where: {
        extensionId: '6',
        invoiceDate: { [Op.between]: ['2026-05-01', '2026-05-30'] },
      },
    });
    expect(existing.actualRevenue).toBe(15);
    expect(existing.revenueProjection).toBe(35);
    expect(existing.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('creates a dated invoice when no monthly invoice exists', async () => {
    const invoice = { id: 2 };
    ExtensionInvoice.findOne.mockResolvedValue(null);
    ExtensionInvoice.create.mockResolvedValue(invoice);

    const res = makeRes();
    await extensionInvoiceController.createExtensionInvoice(
      {
        params: { extensionId: '6' },
        body: { actualRevenue: 5, revenueProjection: 15, invoiceDate: '2026-05-10' },
      },
      res,
      jest.fn()
    );

    expect(ExtensionInvoice.create).toHaveBeenCalledWith({
      extensionId: '6',
      actualRevenue: 5,
      revenueProjection: 15,
      invoiceDate: new Date('2026-05-10'),
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, invoice });
  });

  it('reads invoices globally, by id, and by extension id', async () => {
    ExtensionInvoice.findAll.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([{ id: 3 }]);
    ExtensionInvoice.findByPk.mockResolvedValue({ id: 2 });

    const allRes = makeRes();
    await extensionInvoiceController.getExtensionInvoices({}, allRes, jest.fn());
    expect(allRes.json).toHaveBeenCalledWith({ success: true, invoices: [{ id: 1 }] });

    const byIdRes = makeRes();
    await extensionInvoiceController.getExtensionInvoiceById(
      { params: { id: '2' } },
      byIdRes,
      jest.fn()
    );
    expect(byIdRes.json).toHaveBeenCalledWith({ success: true, invoice: { id: 2 } });

    const byExtensionRes = makeRes();
    await extensionInvoiceController.getExtensionInvoicesByExtensionId(
      { params: { id: '6' } },
      byExtensionRes,
      jest.fn()
    );
    expect(ExtensionInvoice.findAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { extensionId: '6' }, order: [['invoice_date', 'DESC']] })
    );
    expect(byExtensionRes.json).toHaveBeenCalledWith({ success: true, invoices: [{ id: 3 }] });
  });

  it('returns 404 for missing invoice lookups', async () => {
    ExtensionInvoice.findByPk.mockResolvedValue(null);
    const byIdRes = makeRes();
    await extensionInvoiceController.getExtensionInvoiceById(
      { params: { id: '404' } },
      byIdRes,
      jest.fn()
    );
    expect(byIdRes.status).toHaveBeenCalledWith(404);

    ExtensionInvoice.findAll.mockResolvedValue([]);
    const byExtensionRes = makeRes();
    await extensionInvoiceController.getExtensionInvoicesByExtensionId(
      { params: { id: '6' } },
      byExtensionRes,
      jest.fn()
    );
    expect(byExtensionRes.status).toHaveBeenCalledWith(404);
  });

  it('updates an invoice, removing a duplicate invoice in the target month', async () => {
    const invoice = {
      extensionId: '6',
      revenueProjection: 10,
      actualRevenue: 20,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const duplicate = { destroy: jest.fn().mockResolvedValue(undefined) };
    ExtensionInvoice.findByPk.mockResolvedValue(invoice);
    ExtensionInvoice.findOne.mockResolvedValue(duplicate);

    const res = makeRes();
    await extensionInvoiceController.updateExtensionInvoiceById(
      { params: { id: '9' }, body: { actualRevenue: 25, invoiceDate: '2026-06-12' } },
      res,
      jest.fn()
    );

    expect(duplicate.destroy).toHaveBeenCalled();
    expect(invoice.invoiceDate).toEqual(new Date('2026-06-12'));
    expect(invoice.revenueProjection).toBe(10);
    expect(invoice.actualRevenue).toBe(25);
    expect(invoice.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, invoice });
  });

  it('validates update input and missing invoice records', async () => {
    const invalidRes = makeRes();
    await extensionInvoiceController.updateExtensionInvoiceById(
      { params: { id: '9' }, body: {} },
      invalidRes,
      jest.fn()
    );
    expect(invalidRes.status).toHaveBeenCalledWith(400);

    ExtensionInvoice.findByPk.mockResolvedValue(null);
    const missingRes = makeRes();
    await extensionInvoiceController.updateExtensionInvoiceById(
      { params: { id: '9' }, body: { actualRevenue: 1 } },
      missingRes,
      jest.fn()
    );
    expect(missingRes.status).toHaveBeenCalledWith(404);
  });

  it('deletes an invoice or returns 404 when it does not exist', async () => {
    ExtensionInvoice.findByPk.mockResolvedValueOnce(null);
    const missingRes = makeRes();
    await extensionInvoiceController.deleteExtensionInvoiceById(
      { params: { id: '9' } },
      missingRes,
      jest.fn()
    );
    expect(missingRes.status).toHaveBeenCalledWith(404);

    const invoice = { destroy: jest.fn().mockResolvedValue(undefined) };
    ExtensionInvoice.findByPk.mockResolvedValueOnce(invoice);
    const deletedRes = makeRes();
    await extensionInvoiceController.deleteExtensionInvoiceById(
      { params: { id: '9' } },
      deletedRes,
      jest.fn()
    );
    expect(invoice.destroy).toHaveBeenCalled();
    expect(deletedRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'Extension invoice deleted.',
    });
  });

  it('passes controller errors to next', async () => {
    const error = new Error('create failed');
    ExtensionInvoice.findOne.mockRejectedValue(error);
    const next = jest.fn();

    await extensionInvoiceController.createExtensionInvoice(
      {
        params: { extensionId: '6' },
        body: { actualRevenue: 1, revenueProjection: 2, invoiceDate: '2026-05-10' },
      },
      makeRes(),
      next
    );

    expect(logger.error).toHaveBeenCalledWith('createExtensionInvoice error:', error);
    expect(next).toHaveBeenCalledWith(error);
  });
});
