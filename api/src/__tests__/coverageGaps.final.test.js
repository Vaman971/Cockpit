const { mockModel } = require('./helpers/modelMock');

jest.mock('../db/connection', () => ({
  define: jest.fn(),
  query: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  literal: jest.fn(),
}));

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../models/customerModel', () => mockModel());
jest.mock('../models/missionCardCustomerModel', () => mockModel());
jest.mock('../models/missionModel', () => mockModel());
jest.mock('../models/projectModel', () => mockModel());
jest.mock('../models/opportunityModel', () => mockModel());
jest.mock('../models/invoiceModel', () => mockModel());
jest.mock('../models/poModel', () => mockModel());
jest.mock('../models/revenueModel', () => mockModel());
jest.mock('../models/revenueInvoiceModel', () => mockModel());
jest.mock('../models/savingModel', () => mockModel());
jest.mock('../models/sharePointModel', () => mockModel());

const Customer = require('../models/customerModel');
const MissionCard = require('../models/missionModel');
const Project = require('../models/projectModel');
const Invoice = require('../models/invoiceModel');
const PurchaseOrder = require('../models/poModel');
const Revenue = require('../models/revenueModel');
const RevenueInvoice = require('../models/revenueInvoiceModel');
const Saving = require('../models/savingModel');
const SharePoint = require('../models/sharePointModel');
const logger = require('../utils/logger');

const customerController = require('../controllers/customerController');
const projectController = require('../controllers/projectController');
const invoiceController = require('../controllers/invoiceController');
const revenueController = require('../controllers/revenueController');
const revenueInvoiceController = require('../controllers/revenueInvoiceController');
const savingsController = require('../controllers/savingsController');
const sharePointController = require('../controllers/sharePointController');

const projectAfterCreate = Project.afterCreate.mock.calls[0][0];
const projectAfterUpdate = Project.afterUpdate.mock.calls[0][0];
const revenueInvoiceAfterSave = RevenueInvoice.afterSave.mock.calls[0][0];
const revenueInvoiceBeforeDestroy = RevenueInvoice.beforeDestroy.mock.calls[0][0];
const savingAfterSave = Saving.afterSave.mock.calls[0][0];
const savingBeforeDestroy = Saving.beforeDestroy.mock.calls[0][0];

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('final coverage gap tests', () => {
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('customerController remaining error paths', () => {
    it('handles customer update, mission lookup, customer mission lookup, delete, and list errors', async () => {
      Customer.update.mockRejectedValueOnce(new Error('update failed'));
      let res = mockRes();
      await customerController.updatedCustomer({ params: { id: '1' }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      MissionCard.findByPk.mockRejectedValueOnce(new Error('mission failed'));
      res = mockRes();
      await customerController.getCustomerByMissionId({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Customer.findByPk.mockResolvedValueOnce(null);
      res = mockRes();
      await customerController.getMissionByCustomerId({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      Customer.findByPk.mockRejectedValueOnce(new Error('customer failed'));
      res = mockRes();
      await customerController.getMissionByCustomerId({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Customer.destroy.mockRejectedValueOnce(new Error('delete failed'));
      res = mockRes();
      await customerController.deleteCustomer({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);

      Customer.findAll.mockRejectedValueOnce(new Error('list failed'));
      res = mockRes();
      await customerController.getCustomers({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('projectController remaining branches', () => {
    it('covers project hook no-op and hook failures', async () => {
      await projectAfterUpdate({
        changed: () => [],
        dataValues: { id: 1 },
      });

      expect(MissionCard.findAll).not.toHaveBeenCalled();

      MissionCard.create.mockRejectedValueOnce(new Error('mission create failed'));
      await projectAfterCreate({
        dataValues: {
          id: 2,
          project_title: 'Broken',
          cluster: 'A',
          region: 'EU',
          siglum: 'SIG',
          projectType: 'T&M',
        },
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Error creating default mission card:',
        expect.any(Error)
      );

      MissionCard.findAll.mockRejectedValueOnce(new Error('mission update failed'));
      await projectAfterUpdate({
        changed: () => ['active'],
        dataValues: { id: 3, active: false },
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Error propagating project update to mission cards:',
        expect.any(Error)
      );
    });

    it('covers project controller 404 and error paths', async () => {
      Project.update.mockResolvedValueOnce([0]);
      let res = mockRes();
      await projectController.updateProject({ params: { id: '404' }, body: {} }, res, next);
      expect(res.status).toHaveBeenCalledWith(404);

      const error = new Error('project failed');

      Project.update.mockRejectedValueOnce(error);
      await projectController.updateProject({ params: { id: '1' }, body: {} }, mockRes(), next);

      Project.findOne.mockResolvedValueOnce(null);
      res = mockRes();
      await projectController.deleteProject({ params: { id: '1' } }, res, next);
      expect(res.status).toHaveBeenCalledWith(404);

      Project.findOne.mockRejectedValueOnce(error);
      await projectController.deleteProject({ params: { id: '1' } }, mockRes(), next);

      Project.findAll.mockResolvedValueOnce([]);
      res = mockRes();
      await projectController.getProjectByOpportunityId(
        { params: { oppurtunity_id: '1' } },
        res,
        next
      );
      expect(res.status).toHaveBeenCalledWith(404);

      Project.findAll.mockRejectedValueOnce(error);
      await projectController.getProjectByOpportunityId(
        { params: { oppurtunity_id: '1' } },
        mockRes(),
        next
      );

      Project.findOne.mockResolvedValueOnce(null);
      res = mockRes();
      await projectController.getProjectById({ params: { id: '404' } }, res, next);
      expect(res.status).toHaveBeenCalledWith(404);

      Project.findOne.mockRejectedValueOnce(error);
      await projectController.getProjectById({ params: { id: '1' } }, mockRes(), next);

      Project.findAll.mockRejectedValueOnce(error);
      await projectController.getProject({}, mockRes(), next);

      Project.findAll.mockRejectedValueOnce(error);
      await projectController.getProjectExcelData({}, mockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('invoiceController remaining error paths', () => {
    it('covers invoice read/update/delete failures and create-by-po merge branch', async () => {
      const po = { id: '9', poAmount: 1000, poPrice: 0, update: jest.fn().mockResolvedValue({}) };
      const existing = {
        invoiceAmount: 10,
        forecastAmount: 20,
        save: jest.fn().mockResolvedValue({ id: 1 }),
      };

      PurchaseOrder.findByPk.mockResolvedValueOnce(po).mockResolvedValueOnce(po);
      Invoice.sum.mockResolvedValueOnce(0);
      Invoice.findOne.mockResolvedValueOnce(existing);

      let res = mockRes();
      await invoiceController.createInvoiceByPoId(
        {
          params: { poId: '9' },
          body: { invoiceAmount: 5, forecastAmount: 15, invoiceDate: '2025-09-10' },
        },
        res
      );

      expect(existing.invoiceAmount).toBe(15);
      expect(existing.forecastAmount).toBe(35);
      expect(existing.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);

      Invoice.findAll.mockRejectedValueOnce(new Error('list failed'));
      res = mockRes();
      await invoiceController.getInvoice({}, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Invoice.findByPk.mockRejectedValueOnce(new Error('detail failed'));
      res = mockRes();
      await invoiceController.getInvoiceById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Invoice.findAll.mockRejectedValueOnce(new Error('po invoices failed'));
      res = mockRes();
      await invoiceController.getInvoicesByPoId({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Invoice.findByPk.mockResolvedValueOnce(null);
      res = mockRes();
      await invoiceController.updateInvoiceById(
        { params: { id: '404' }, body: { invoiceAmount: 10 } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(404);

      Invoice.findByPk.mockRejectedValueOnce(new Error('delete failed'));
      res = mockRes();
      await invoiceController.deleteInvoiceById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('revenueController remaining errors', () => {
    it('passes all revenue controller errors to next', async () => {
      const error = new Error('revenue failed');

      Revenue.findByPk.mockRejectedValueOnce(error);
      await revenueController.getRevenueById({ params: { id: '1' } }, mockRes(), next);

      Revenue.update.mockRejectedValueOnce(error);
      await revenueController.updateRevenue({ params: { id: '1' }, body: {} }, mockRes(), next);

      Revenue.findAll.mockRejectedValueOnce(error);
      await revenueController.getLatestRevenues({}, mockRes(), next);

      RevenueInvoice.findAll.mockRejectedValueOnce(error);
      await revenueController.getRevenueInvoices({ params: { id: '1' } }, mockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledTimes(4);
    });
  });

  describe('revenueInvoiceController remaining paths', () => {
    it('covers hook no-revenue and hook error branches', async () => {
      RevenueInvoice.sum.mockResolvedValue(0);
      Revenue.findByPk.mockResolvedValueOnce(null);

      await revenueInvoiceAfterSave({ revenueId: 1 });
      expect(Revenue.update).not.toHaveBeenCalled();

      Revenue.findByPk.mockResolvedValueOnce(null);
      await revenueInvoiceBeforeDestroy({ revenueId: 1 });

      RevenueInvoice.sum.mockRejectedValueOnce(new Error('sum failed'));
      await revenueInvoiceAfterSave({ revenueId: 2 });
      expect(logger.error).toHaveBeenCalledWith(
        'RevenueInvoice afterSave hook error:',
        expect.any(Error)
      );

      Revenue.findByPk.mockRejectedValueOnce(new Error('lookup failed'));
      await revenueInvoiceBeforeDestroy({ revenueId: 2 });
      expect(logger.error).toHaveBeenCalledWith(
        'RevenueInvoice beforeDestroy hook error:',
        expect.any(Error)
      );
    });

    it('covers revenue invoice controller error branches', async () => {
      const error = new Error('invoice failed');

      RevenueInvoice.findOne.mockRejectedValueOnce(error);
      await revenueInvoiceController.createRevenueInvoice(
        {
          params: { revenueId: '1' },
          body: {
            forecastRevenue: 1,
            actualRevenue: 1,
            plannedRevenue: 1,
            invoiceDate: '2025-01-01',
          },
        },
        mockRes(),
        next
      );
      expect(next).toHaveBeenCalledWith(error);

      RevenueInvoice.findAll.mockRejectedValueOnce(error);
      let res = mockRes();
      await revenueInvoiceController.getRevenueInvoices({}, res);
      expect(res.status).toHaveBeenCalledWith(500);

      RevenueInvoice.findByPk.mockRejectedValueOnce(error);
      res = mockRes();
      await revenueInvoiceController.getRevenueInvoiceById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      RevenueInvoice.findAll.mockRejectedValueOnce(error);
      res = mockRes();
      await revenueInvoiceController.getRevenueInvoicesByRevenueId({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      RevenueInvoice.findByPk.mockResolvedValueOnce(null);
      res = mockRes();
      await revenueInvoiceController.updateRevenueInvoiceById(
        { params: { id: '404' }, body: { status: 'paid' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(404);

      RevenueInvoice.findByPk.mockRejectedValueOnce(error);
      res = mockRes();
      await revenueInvoiceController.deleteRevenueInvoiceById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('savingsController remaining paths', () => {
    it('covers saving hook no-revenue and error branches', async () => {
      Saving.sum.mockResolvedValueOnce(50);
      Revenue.findByPk.mockResolvedValueOnce(null);
      await savingAfterSave({ revenueId: 1 });

      Revenue.findByPk.mockResolvedValueOnce(null);
      await savingBeforeDestroy({ revenueId: 1 });

      Saving.sum.mockRejectedValueOnce(new Error('sum failed'));
      await savingAfterSave({ revenueId: 2 });
      expect(logger.error).toHaveBeenCalledWith(
        'savingModel afterSave hook error:',
        expect.any(Error)
      );

      Revenue.findByPk.mockRejectedValueOnce(new Error('lookup failed'));
      await savingBeforeDestroy({ revenueId: 2 });
      expect(logger.error).toHaveBeenCalledWith(
        'savingModel beforeDestroy hook error:',
        expect.any(Error)
      );
    });

    it('covers saving controller error branches', async () => {
      const error = new Error('saving failed');

      Saving.findOne.mockRejectedValueOnce(error);
      let res = mockRes();
      await savingsController.createSaving(
        { params: { revenueId: '1' }, body: { savingAmount: 10, savingDate: '2025-01-01' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(500);

      Saving.findAll.mockRejectedValueOnce(error);
      res = mockRes();
      await savingsController.getSavings({}, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Saving.findByPk.mockRejectedValueOnce(error);
      res = mockRes();
      await savingsController.getSavingsById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Saving.findAll.mockRejectedValueOnce(error);
      res = mockRes();
      await savingsController.getSavingsByRevenueId({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Saving.findByPk.mockRejectedValueOnce(error);
      res = mockRes();
      await savingsController.updateSavingsById(
        { params: { id: '1' }, body: { savingAmount: 20 } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(500);

      Saving.findByPk.mockRejectedValueOnce(error);
      res = mockRes();
      await savingsController.deleteSavingById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('sharePointController remaining errors', () => {
    it('covers sharepoint create/get-by-id/delete/update error branches', async () => {
      const error = new Error('sharepoint failed');

      SharePoint.create.mockRejectedValueOnce(error);
      let res = mockRes();
      await sharePointController.createSharepointLink({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);

      SharePoint.findAll.mockRejectedValueOnce(error);
      res = mockRes();
      await sharePointController.getSharepointLinkById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      SharePoint.destroy.mockRejectedValueOnce(error);
      res = mockRes();
      await sharePointController.deleteSharepointLink({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);

      SharePoint.update.mockRejectedValueOnce(error);
      res = mockRes();
      await sharePointController.updateSharepointLink({ params: { id: '1' }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
