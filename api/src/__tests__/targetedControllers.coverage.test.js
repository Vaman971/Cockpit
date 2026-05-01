const { mockModel, mockRow } = require('./helpers/modelMock');

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../models/customerModel', () => mockModel());
jest.mock('../models/missionCardCustomerModel', () => mockModel());
jest.mock('../models/missionModel', () => mockModel());
jest.mock('../models/profileModel', () => mockModel());
jest.mock('../models/userModel', () => mockModel());
jest.mock('../models/UserTeams', () => mockModel());
jest.mock('../models/TeamModel', () => mockModel());
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
const UserProfile = require('../models/profileModel');
const User = require('../models/userModel');
const UserTeams = require('../models/UserTeams');
const Team = require('../models/TeamModel');
const Project = require('../models/projectModel');
const Invoice = require('../models/invoiceModel');
const PurchaseOrder = require('../models/poModel');
const Revenue = require('../models/revenueModel');
const RevenueInvoice = require('../models/revenueInvoiceModel');
const Saving = require('../models/savingModel');
const SharePoint = require('../models/sharePointModel');
const logger = require('../utils/logger');

const customerController = require('../controllers/customerController');
const profileController = require('../controllers/profileController');
const projectController = require('../controllers/projectController');
const invoiceController = require('../controllers/invoiceController');
const revenueController = require('../controllers/revenueController');
const revenueInvoiceController = require('../controllers/revenueInvoiceController');
const savingsController = require('../controllers/savingsController');
const sharePointController = require('../controllers/sharePointController');

const registeredHooks = {
  profileAfterCreate: User.afterCreate.mock.calls[0][0],
  profileAfterUpdate: User.afterUpdate.mock.calls[0][0],
  projectAfterCreate: Project.afterCreate.mock.calls[0][0],
  projectAfterUpdate: Project.afterUpdate.mock.calls[0][0],
  invoiceAfterSave: Invoice.afterSave.mock.calls[0][0],
  revenueInvoiceAfterSave: RevenueInvoice.afterSave.mock.calls[0][0],
  revenueInvoiceBeforeDestroy: RevenueInvoice.beforeDestroy.mock.calls[0][0],
  savingAfterSave: Saving.afterSave.mock.calls[0][0],
  savingBeforeDestroy: Saving.beforeDestroy.mock.calls[0][0],
};

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();

describe('targeted backend controller coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('registered model hooks', () => {
    it('creates and updates user profiles from user hooks', async () => {
      const profile = { update: jest.fn().mockResolvedValue({}) };
      UserProfile.create.mockResolvedValue({});
      UserProfile.findAll.mockResolvedValue([profile]);

      await registeredHooks.profileAfterCreate({
        user_id: 10,
        username: 'jane',
        email: 'jane@test.com',
      });
      await registeredHooks.profileAfterUpdate({
        user_id: 10,
        changed: () => ['username', 'email', 'burden_rate'],
        dataValues: {
          username: 'jane.new',
          email: 'jane.new@test.com',
          burden_rate: 20,
        },
      });

      expect(UserProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'jane',
          email: 'jane@test.com',
          userProfileId: 10,
        })
      );
      expect(profile.update).toHaveBeenCalledWith({
        username: 'jane.new',
        email: 'jane.new@test.com',
        burden_rate: 20,
      });
    });

    it('creates a default mission and propagates project field changes', async () => {
      const mission = { update: jest.fn().mockResolvedValue({}) };
      MissionCard.create.mockResolvedValue({});
      MissionCard.findAll.mockResolvedValue([mission]);

      await registeredHooks.projectAfterCreate({
        dataValues: {
          id: 2,
          project_title: 'Falcon',
          cluster: 'C1',
          region: 'EU',
          siglum: 'SIG',
          projectType: 'T&M',
        },
      });
      await registeredHooks.projectAfterUpdate({
        changed: () => ['active', 'cluster', 'region', 'siglum'],
        dataValues: {
          id: 2,
          active: false,
          cluster: 'C2',
          region: 'IN',
          siglum: 'NEW',
        },
      });

      expect(MissionCard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          missionDescription: 'Falcon',
          projMissionId: 2,
          active: true,
        })
      );
      expect(mission.update).toHaveBeenCalledWith({
        active: false,
        cluster: 'C2',
        region: 'IN',
        siglum: 'NEW',
      });
    });

    it('syncs invoice totals and currency after invoice save', async () => {
      Invoice.sum.mockResolvedValueOnce(300).mockResolvedValueOnce(125);
      PurchaseOrder.findByPk.mockResolvedValue({ id: 7, currencyCode: 'EUR' });
      PurchaseOrder.update.mockResolvedValue([1]);
      Invoice.update.mockResolvedValue([1]);

      await registeredHooks.invoiceAfterSave({
        poId: 7,
        dataValues: { id: 4 },
      });

      expect(PurchaseOrder.update).toHaveBeenCalledWith(
        { poPrice: 300, poForecast: 125 },
        { where: { id: 7 }, hooks: false }
      );
      expect(Invoice.update).toHaveBeenCalledWith({ currencyCode: 'EUR' }, { where: { id: 4 } });
    });

    it('syncs revenue invoice totals and subtracts on destroy', async () => {
      const revenue = {
        forecastRevenue: 100,
        plannedRevenue: 90,
        actualRevenue: 80,
        update: jest.fn().mockResolvedValue({}),
      };
      RevenueInvoice.sum
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(5);
      Revenue.findByPk.mockResolvedValue(revenue);

      await registeredHooks.revenueInvoiceAfterSave({ revenueId: 6 });
      await registeredHooks.revenueInvoiceBeforeDestroy({
        revenueId: 6,
        forecastRevenue: 30,
        plannedRevenue: 40,
        actualRevenue: 50,
      });

      expect(revenue.update).toHaveBeenNthCalledWith(
        1,
        { forecastRevenue: 10, actualRevenue: 5, plannedRevenue: 20 },
        { hooks: false }
      );
      expect(revenue.update).toHaveBeenNthCalledWith(
        2,
        { forecastRevenue: 70, plannedRevenue: 50, actualRevenue: 30 },
        { hooks: false }
      );
    });

    it('syncs saving totals and subtracts on destroy', async () => {
      const revenue = { saving: 80, update: jest.fn().mockResolvedValue({}) };
      Saving.sum.mockResolvedValue(45);
      Revenue.findByPk.mockResolvedValue(revenue);

      await registeredHooks.savingAfterSave({ revenueId: 3 });
      await registeredHooks.savingBeforeDestroy({ revenueId: 3, savingAmount: 25 });

      expect(revenue.update).toHaveBeenNthCalledWith(1, { saving: 45 }, { hooks: false });
      expect(revenue.update).toHaveBeenNthCalledWith(2, { saving: 55 }, { hooks: false });
    });

    it('logs hook errors without throwing', async () => {
      UserProfile.create.mockRejectedValue(new Error('profile create failed'));

      await registeredHooks.profileAfterCreate({ user_id: 1, username: 'bad', email: 'bad@test' });

      expect(logger.error).toHaveBeenCalledWith(
        'Error creating user profile on afterCreate:',
        expect.any(Error)
      );
    });
  });

  describe('customerController additional branches', () => {
    it('updates an existing customer and returns the refreshed row', async () => {
      const customer = { customer_id: 3, customer_name: 'Airbus' };
      Customer.update.mockResolvedValue([1]);
      Customer.findByPk.mockResolvedValue(customer);
      const res = mockRes();

      await customerController.updatedCustomer(
        { params: { id: '3' }, body: { customer_name: 'Airbus' } },
        res
      );

      expect(Customer.update).toHaveBeenCalledWith(
        { customer_name: 'Airbus' },
        { where: { customer_id: '3' } }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Customer updated successfully.',
        customer,
      });
    });

    it('returns missions linked to a customer', async () => {
      const customer = { customer_id: 1, missionCards: [{ id: 9 }] };
      Customer.findByPk.mockResolvedValue(customer);
      const res = mockRes();

      await customerController.getMissionByCustomerId({ params: { id: '1' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, customer, missions: customer.missionCards })
      );
    });

    it('returns all customers', async () => {
      const customers = [{ customer_id: 1 }, { customer_id: 2 }];
      Customer.findAll.mockResolvedValue(customers);
      const res = mockRes();

      await customerController.getCustomers({}, res);

      expect(res.json).toHaveBeenCalledWith(customers);
    });

    it('returns customers attached to a mission', async () => {
      const mission = { id: 4, customers: [{ customer_id: 11 }] };
      MissionCard.findByPk.mockResolvedValue(mission);
      const res = mockRes();

      await customerController.getCustomerByMissionId({ params: { id: '4' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, customers: mission.customers })
      );
    });

    it('handles missing mission, failed update, successful delete, and create errors', async () => {
      MissionCard.findByPk.mockResolvedValue(null);
      let res = mockRes();
      await customerController.getCustomerByMissionId({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      Customer.update.mockResolvedValue([0]);
      res = mockRes();
      await customerController.updatedCustomer({ params: { id: '9' }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      Customer.destroy.mockResolvedValue(1);
      res = mockRes();
      await customerController.deleteCustomer({ params: { id: '9' } }, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Customer deleted successfully' });

      Customer.create.mockRejectedValue(new Error('bad input'));
      res = mockRes();
      await customerController.createCustomer({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'bad input' });
    });
  });

  describe('profileController detail aggregation', () => {
    it('builds mission summaries for all profiles', async () => {
      UserProfile.findAll.mockResolvedValue([
        {
          id: 1,
          userProfileId: 20,
          username: 'lee',
          contactDetails: '555',
          total_occupancy: 60,
          location: 'BLR',
          designation: 'Lead',
        },
      ]);
      UserTeams.findAll.mockResolvedValue([{ team_id: 5, occupancy: 40, active: true }]);
      Team.findByPk.mockResolvedValue({ id: 5, mission_card_team_id: 7 });
      MissionCard.findByPk.mockResolvedValue({ airbusId: 'M-7' });
      const res = mockRes();

      await profileController.getProfileDetails({}, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        profiles: [
          expect.objectContaining({
            username: 'lee',
            missions: [
              {
                id: 7,
                missionId: 'M-7',
                individualOccupancy: 40,
                active: true,
              },
            ],
          }),
        ],
      });
    });

    it('returns a single profile without missions when no teams exist', async () => {
      UserProfile.findOne.mockResolvedValue({
        id: 1,
        username: 'sam',
        contactDetails: '123',
        contactCode: '+91',
        total_occupancy: 0,
        profileImage: null,
        designation: 'Dev',
        location: 'Pune',
        email: 'sam@test.com',
      });
      UserTeams.findAll.mockResolvedValue([]);
      const res = mockRes();

      await profileController.getSingleProfileDetails({ params: { userId: '9' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, username: 'sam', totalOccupancy: 0 })
      );
    });

    it('returns 404 when profile details are empty', async () => {
      UserProfile.findAll.mockResolvedValue([]);
      const res = mockRes();

      await profileController.getProfileDetails({}, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'No profiles found.' });
    });

    it('returns single profile details with calculated mission duration', async () => {
      UserProfile.findOne.mockResolvedValue({
        id: 5,
        username: 'maya',
        contactDetails: '321',
        contactCode: '+33',
        total_occupancy: 80,
        profileImage: Buffer.from('img'),
        designation: 'Engineer',
        location: 'Paris',
        email: 'maya@test.com',
      });
      UserTeams.findAll.mockResolvedValue([{ team_id: 10, occupancy: 80, active: true }]);
      Team.findByPk.mockResolvedValue({ id: 10, mission_card_team_id: 22 });
      MissionCard.findByPk.mockResolvedValue({
        id: 22,
        airbusId: 'AB-22',
        missionDescription: 'Cabin',
        missionStartDate: '2025-01-01',
        missionEndDate: '2025-04-01',
        status: 'active',
      });
      const res = mockRes();

      await profileController.getSingleProfileDetails({ params: { userId: '15' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          missions: [
            expect.objectContaining({
              missionId: 'AB-22',
              duration: 3,
              individualOccupancy: 80,
            }),
          ],
        })
      );
    });

    it('handles profile file updates and single-profile 404', async () => {
      UserProfile.update.mockResolvedValue([1]);
      UserProfile.findOne.mockResolvedValueOnce({ id: 1, username: 'with-file' });
      const res = mockRes();

      await profileController.updateProfile(
        {
          params: { username: 'with-file' },
          body: { firstName: 'With' },
          file: { buffer: Buffer.from('avatar') },
        },
        res,
        next
      );

      expect(UserProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({ profileImage: Buffer.from('avatar') }),
        { where: { username: 'with-file' } }
      );

      UserProfile.findOne.mockResolvedValueOnce(null);
      const missingRes = mockRes();
      await profileController.getSingleProfileDetails(
        { params: { userId: '404' } },
        missingRes,
        next
      );
      expect(missingRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('projectController excel export', () => {
    it('formats project excel rows with lead usernames', async () => {
      Project.findAll.mockResolvedValue([
        {
          id: 1,
          region: 'EU',
          project_title: 'A350',
          projectLead: 12,
          projectType: 'Fixed',
          cluster: 'A',
          siglum: 'SIG',
          created_on: '2025-01-01',
          updated_on: '2025-01-02',
          active: true,
          status: 'open',
          leadUser: { username: 'lead.user' },
        },
      ]);
      const res = mockRes();

      await projectController.getProjectExcelData({}, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        projects: [
          expect.objectContaining({
            id: 1,
            projectLead: 'lead.user',
            project_title: 'A350',
          }),
        ],
      });
    });
  });

  describe('invoiceController monthly and CRUD paths', () => {
    it('merges createInvoice into an existing monthly invoice', async () => {
      const po = { id: 7, poAmount: 1000, poPrice: 500, update: jest.fn().mockResolvedValue({}) };
      const invoice = {
        invoiceAmount: 100,
        forecastAmount: 150,
        save: jest.fn().mockResolvedValue({ id: 2, invoiceAmount: 300, forecastAmount: 350 }),
      };
      PurchaseOrder.findByPk.mockResolvedValue(po);
      Invoice.sum.mockResolvedValue(200);
      Invoice.findOne.mockResolvedValue(invoice);
      const res = mockRes();

      await invoiceController.createInvoice(
        {
          body: {
            poId: 7,
            invoiceAmount: 200,
            forecastAmount: 200,
            invoiceDate: '2025-02-15',
          },
        },
        res
      );

      expect(invoice.invoiceAmount).toBe(300);
      expect(invoice.forecastAmount).toBe(350);
      expect(invoice.save).toHaveBeenCalled();
      expect(po.update).toHaveBeenCalledWith({ poStatus: 'open' }, { hooks: false });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('creates a placeholder invoice by PO id', async () => {
      const invoice = { id: 1, poId: '8', invoiceAmount: 0 };
      Invoice.create.mockResolvedValue(invoice);
      const res = mockRes();

      await invoiceController.createInvoiceByPoId(
        { params: { poId: '8' }, body: { invoiceAmount: 0, forecastAmount: 0, invoiceDate: '' } },
        res
      );

      expect(Invoice.create).toHaveBeenCalledWith({
        poId: '8',
        invoiceAmount: 0,
        forecastAmount: 0,
        invoiceDate: null,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('updates an invoice and removes another invoice in the same target month', async () => {
      const current = mockRow({
        id: 3,
        poId: 7,
        invoiceAmount: 100,
        forecastAmount: 50,
        invoiceDate: new Date('2025-01-01'),
      });
      const duplicate = mockRow({ id: 4, poId: 7 });
      const po = { id: 7, poAmount: 1000, poPrice: 1000, update: jest.fn().mockResolvedValue({}) };
      Invoice.findByPk.mockResolvedValue(current);
      Invoice.findOne.mockResolvedValue(duplicate);
      Invoice.sum.mockResolvedValue(100);
      PurchaseOrder.findByPk.mockResolvedValue(po);
      const res = mockRes();

      await invoiceController.updateInvoiceById(
        {
          params: { id: '3' },
          body: { invoiceAmount: 150, forecastAmount: 60, invoiceDate: '2025-03-12' },
        },
        res
      );

      expect(duplicate.destroy).toHaveBeenCalled();
      expect(current.save).toHaveBeenCalled();
      expect(po.update).toHaveBeenCalledWith({ poStatus: 'closed' }, { hooks: false });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns invoices for a PO id', async () => {
      const invoices = [{ id: 1, po_id: 7 }];
      Invoice.findAll.mockResolvedValue(invoices);
      const res = mockRes();

      await invoiceController.getInvoicesByPoId({ params: { id: '7' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(invoices);
    });

    it('creates a non-placeholder invoice by PO id when no monthly invoice exists', async () => {
      PurchaseOrder.findByPk.mockResolvedValue({
        id: 9,
        poAmount: 500,
        poPrice: 0,
        update: jest.fn().mockResolvedValue({}),
      });
      Invoice.sum.mockResolvedValue(0);
      Invoice.findOne.mockResolvedValue(null);
      Invoice.create.mockResolvedValue({ id: 9, poId: '9' });
      const res = mockRes();

      await invoiceController.createInvoiceByPoId(
        {
          params: { poId: '9' },
          body: { invoiceAmount: 100, forecastAmount: 110, invoiceDate: '2025-07-02' },
        },
        res
      );

      expect(Invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({ poId: '9', invoiceAmount: 100, forecastAmount: 110 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('covers invoice getters, missing rows, and delete with purchase adjustment', async () => {
      const invoice = mockRow({ id: 1, poId: 3, invoiceAmount: 40, forecastAmount: 10 });
      const purchase = {
        id: 3,
        poAmount: 100,
        poPrice: 40,
        poForecast: 10,
        save: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      };
      Invoice.findAll.mockResolvedValueOnce([invoice]).mockResolvedValueOnce([]);
      Invoice.findByPk
        .mockResolvedValueOnce(invoice)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(invoice);
      PurchaseOrder.findByPk.mockResolvedValue(purchase);

      let res = mockRes();
      await invoiceController.getInvoice({}, res);
      expect(res.status).toHaveBeenCalledWith(200);

      res = mockRes();
      await invoiceController.getInvoiceById({ params: { id: '1' } }, res);
      expect(res.json).toHaveBeenCalledWith(invoice);

      res = mockRes();
      await invoiceController.getInvoiceById({ params: { id: '99' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      res = mockRes();
      await invoiceController.getInvoicesByPoId({ params: { id: '3' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      res = mockRes();
      await invoiceController.deleteInvoiceById({ params: { id: '1' } }, res);
      expect(purchase.poPrice).toBe(0);
      expect(purchase.poForecast).toBe(0);
      expect(invoice.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 500 when invoice amount exceeds the purchase order', async () => {
      PurchaseOrder.findByPk.mockResolvedValue({ id: 7, poAmount: 100, poPrice: 0 });
      Invoice.sum.mockResolvedValue(90);
      const res = mockRes();

      await invoiceController.createInvoice(
        {
          body: {
            poId: 7,
            invoiceAmount: 20,
            forecastAmount: 0,
            invoiceDate: '2025-01-01',
          },
        },
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Total invoice amount exceeds PO amount' });
    });
  });

  describe('revenueController remaining success paths', () => {
    it('creates, lists, updates, and fetches revenue invoices', async () => {
      const revenue = { id: 1, plannedRevenue: 100 };
      Revenue.create.mockResolvedValue(revenue);
      Revenue.findAll.mockResolvedValue([revenue]);
      Revenue.update.mockResolvedValue([1]);
      RevenueInvoice.findAll.mockResolvedValue([{ id: 5, revenueId: '1' }]);

      const createRes = mockRes();
      await revenueController.createRevenue({ body: revenue }, createRes, next);
      expect(createRes.status).toHaveBeenCalledWith(201);

      const listRes = mockRes();
      await revenueController.getLatestRevenues({}, listRes, next);
      expect(Revenue.findAll).toHaveBeenCalledWith({ limit: 5, order: [['created_at', 'DESC']] });
      expect(listRes.status).toHaveBeenCalledWith(200);

      const updateRes = mockRes();
      await revenueController.updateRevenue(
        { params: { id: '1' }, body: { plannedRevenue: 120 } },
        updateRes,
        next
      );
      expect(updateRes.status).toHaveBeenCalledWith(200);

      const invoicesRes = mockRes();
      await revenueController.getRevenueInvoices({ params: { id: '1' } }, invoicesRes, next);
      expect(invoicesRes.json).toHaveBeenCalledWith({
        success: true,
        invoices: [{ id: 5, revenueId: '1' }],
      });
    });

    it('gets revenues, gets by id, and returns update 404', async () => {
      const revenue = { id: 2 };
      Revenue.findAll.mockResolvedValue([revenue]);
      Revenue.findByPk.mockResolvedValue(revenue);
      Revenue.update.mockResolvedValue([0]);

      let res = mockRes();
      await revenueController.getRevenues({}, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, revenues: [revenue] });

      res = mockRes();
      await revenueController.getRevenueById({ params: { id: '2' } }, res, next);
      expect(res.status).toHaveBeenCalledWith(200);

      res = mockRes();
      await revenueController.updateRevenue({ params: { id: '404' }, body: {} }, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('passes revenue query errors to next', async () => {
      const error = new Error('revenue query failed');
      Revenue.findAll.mockRejectedValue(error);

      await revenueController.getRevenues({}, mockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('revenueInvoiceController monthly and CRUD paths', () => {
    it('creates a new revenue invoice for a new month', async () => {
      RevenueInvoice.findOne.mockResolvedValue(null);
      RevenueInvoice.create.mockResolvedValue({ id: 1, revenueId: '2' });
      const res = mockRes();

      await revenueInvoiceController.createRevenueInvoice(
        {
          params: { revenueId: '2' },
          body: {
            forecastRevenue: 10,
            actualRevenue: 5,
            plannedRevenue: 12,
            status: 'open',
            invoiceDate: '2025-04-10',
          },
        },
        res,
        next
      );

      expect(RevenueInvoice.create).toHaveBeenCalledWith(
        expect.objectContaining({ revenueId: '2', status: 'open' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('updates an existing revenue invoice for the same month', async () => {
      const invoice = {
        forecastRevenue: 3,
        actualRevenue: 4,
        plannedRevenue: 5,
        status: 'draft',
        save: jest.fn().mockResolvedValue({}),
      };
      RevenueInvoice.findOne.mockResolvedValue(invoice);
      const res = mockRes();

      await revenueInvoiceController.createRevenueInvoice(
        {
          params: { revenueId: '2' },
          body: {
            forecastRevenue: 7,
            actualRevenue: 6,
            plannedRevenue: 5,
            status: 'closed',
            invoiceDate: '2025-04-10',
          },
        },
        res,
        next
      );

      expect(invoice.forecastRevenue).toBe(10);
      expect(invoice.actualRevenue).toBe(10);
      expect(invoice.plannedRevenue).toBe(10);
      expect(invoice.status).toBe('closed');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('updates a revenue invoice and destroys a duplicate target-month row', async () => {
      const current = mockRow({ id: 1, revenueId: 9, forecastRevenue: 1, actualRevenue: 2 });
      const duplicate = mockRow({ id: 8 });
      RevenueInvoice.findByPk.mockResolvedValue(current);
      RevenueInvoice.findOne.mockResolvedValue(duplicate);
      const res = mockRes();

      await revenueInvoiceController.updateRevenueInvoiceById(
        {
          params: { id: '1' },
          body: { invoiceDate: '2025-05-05', plannedRevenue: 30, status: 'paid' },
        },
        res
      );

      expect(duplicate.destroy).toHaveBeenCalled();
      expect(current.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns revenue invoices by revenue id', async () => {
      const invoices = [{ id: 1, revenueId: 4 }];
      RevenueInvoice.findAll.mockResolvedValue(invoices);
      const res = mockRes();

      await revenueInvoiceController.getRevenueInvoicesByRevenueId({ params: { id: '4' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(invoices);
    });

    it('covers revenue invoice list/id, missing rows, no-input update, and delete 404', async () => {
      const invoice = { id: 1, revenueId: 4 };
      RevenueInvoice.findAll.mockResolvedValueOnce([invoice]).mockResolvedValueOnce([]);
      RevenueInvoice.findByPk
        .mockResolvedValueOnce(invoice)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      let res = mockRes();
      await revenueInvoiceController.getRevenueInvoices({}, res);
      expect(res.status).toHaveBeenCalledWith(200);

      res = mockRes();
      await revenueInvoiceController.getRevenueInvoiceById({ params: { id: '1' } }, res);
      expect(res.json).toHaveBeenCalledWith(invoice);

      res = mockRes();
      await revenueInvoiceController.getRevenueInvoiceById({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      res = mockRes();
      await revenueInvoiceController.getRevenueInvoicesByRevenueId({ params: { id: '4' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      res = mockRes();
      await revenueInvoiceController.updateRevenueInvoiceById(
        { params: { id: '1' }, body: {} },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);

      res = mockRes();
      await revenueInvoiceController.deleteRevenueInvoiceById({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('savingsController monthly and CRUD paths', () => {
    it('creates a new saving for a new month', async () => {
      Saving.findOne.mockResolvedValue(null);
      Saving.create.mockResolvedValue({ id: 1, savingAmount: 25 });
      const res = mockRes();

      await savingsController.createSaving(
        {
          params: { revenueId: '3' },
          body: { savingAmount: 25, remark: 'saved', savingDate: '2025-06-01' },
        },
        res
      );

      expect(Saving.create).toHaveBeenCalledWith(
        expect.objectContaining({ revenueId: '3', savingAmount: 25, remark: 'saved' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('adds to an existing saving in the same month', async () => {
      const saving = { savingAmount: 10, save: jest.fn().mockResolvedValue({}) };
      Saving.findOne.mockResolvedValue(saving);
      const res = mockRes();

      await savingsController.createSaving(
        {
          params: { revenueId: '3' },
          body: { savingAmount: 15, remark: 'saved', savingDate: '2025-06-11' },
        },
        res
      );

      expect(saving.savingAmount).toBe(25);
      expect(saving.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deletes an existing saving', async () => {
      const saving = mockRow({ id: 2, savingAmount: 50 });
      Saving.findByPk.mockResolvedValue(saving);
      const res = mockRes();

      await savingsController.deleteSavingById({ params: { id: '2' } }, res);

      expect(saving.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Savings deleted successfully' });
    });

    it('returns savings list and a single saving by id', async () => {
      const savings = [{ id: 1 }];
      Saving.findAll.mockResolvedValue(savings);
      Saving.findByPk.mockResolvedValue(savings[0]);

      const listRes = mockRes();
      await savingsController.getSavings({}, listRes);
      expect(listRes.status).toHaveBeenCalledWith(200);
      expect(listRes.json).toHaveBeenCalledWith(savings);

      const oneRes = mockRes();
      await savingsController.getSavingsById({ params: { id: '1' } }, oneRes);
      expect(oneRes.status).toHaveBeenCalledWith(200);
      expect(oneRes.json).toHaveBeenCalledWith(savings[0]);
    });

    it('updates saving date, removes duplicate, and validates empty update', async () => {
      const duplicate = mockRow({ id: 8 });
      const saving = mockRow({ id: 1, savingAmount: 20, savingDate: new Date('2025-01-01') });
      Saving.findOne.mockResolvedValue(duplicate);
      Saving.findByPk.mockResolvedValue(saving);
      let res = mockRes();

      await savingsController.updateSavingsById(
        {
          params: { id: '1' },
          body: { savingAmount: 30, savingDate: '2025-08-12', remark: 'updated' },
        },
        res
      );

      expect(duplicate.destroy).toHaveBeenCalled();
      expect(saving.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);

      res = mockRes();
      await savingsController.updateSavingsById({ params: { id: '1' }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 for missing saving by id and missing delete row', async () => {
      Saving.findByPk.mockResolvedValue(null);

      let res = mockRes();
      await savingsController.getSavingsById({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      res = mockRes();
      await savingsController.deleteSavingById({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('sharePointController remaining paths', () => {
    it('creates, lists, deletes, and assigns sharepoint links', async () => {
      const link = { id: 1, url_link: 'https://example.test/doc' };
      SharePoint.create.mockResolvedValue(link);
      SharePoint.findAll.mockResolvedValue([link]);
      SharePoint.destroy.mockResolvedValue(1);
      MissionCard.findByPk.mockResolvedValue({ id: 12 });

      const createRes = mockRes();
      await sharePointController.createSharepointLink({ body: link }, createRes);
      expect(createRes.status).toHaveBeenCalledWith(201);

      const listRes = mockRes();
      await sharePointController.getSharepointLink({}, listRes);
      expect(listRes.json).toHaveBeenCalledWith([link]);

      const deleteRes = mockRes();
      await sharePointController.deleteSharepointLink({ params: { id: '1' } }, deleteRes);
      expect(deleteRes.json).toHaveBeenCalledWith({ message: 'Link deleted successfully' });

      SharePoint.create.mockResolvedValueOnce({ id: 2, url_link: 'a' }).mockResolvedValueOnce({
        id: 3,
        url_link: 'b',
      });
      const assignRes = mockRes();
      await sharePointController.assignLinkToMission(
        { params: { id: '12' }, body: { links: ['a', 'b'] } },
        assignRes
      );
      expect(assignRes.status).toHaveBeenCalledWith(200);
      expect(assignRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'SharePoint links successfully assigned to mission' })
      );
    });

    it('returns links by mission id and reports missing update rows', async () => {
      const links = [{ id: 1, doc_mission_id: 4 }];
      SharePoint.findAll.mockResolvedValue(links);
      SharePoint.update.mockResolvedValue([0]);

      const getRes = mockRes();
      await sharePointController.getSharepointLinkById({ params: { id: '4' } }, getRes);
      expect(getRes.json).toHaveBeenCalledWith(links);

      const updateRes = mockRes();
      await sharePointController.updateSharepointLink(
        { params: { id: '99' }, body: {} },
        updateRes
      );
      expect(updateRes.status).toHaveBeenCalledWith(404);
      expect(updateRes.json).toHaveBeenCalledWith({
        message: 'SharePoint link not found or no changes made.',
      });
    });

    it('returns controller-level errors for failed sharepoint operations', async () => {
      SharePoint.findAll.mockRejectedValueOnce(new Error('list failed'));
      let res = mockRes();
      await sharePointController.getSharepointLink({}, res);
      expect(res.status).toHaveBeenCalledWith(500);

      SharePoint.destroy.mockResolvedValue(0);
      res = mockRes();
      await sharePointController.deleteSharepointLink({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      MissionCard.findByPk.mockRejectedValue(new Error('mission lookup failed'));
      res = mockRes();
      await sharePointController.assignLinkToMission(
        { params: { id: '12' }, body: { links: ['x'] } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
