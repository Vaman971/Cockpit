const { mockModel, mockRow } = require('./helpers/modelMock');

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../models/currencyModel', () => mockModel({ bulkCreate: jest.fn() }));
jest.mock('../models/customerModel', () => mockModel());
jest.mock('../models/missionCardCustomerModel', () => mockModel());
jest.mock('../models/expenseModel', () => mockModel());
jest.mock('../models/forecastModel', () => mockModel());
jest.mock('../models/invoiceModel', () => mockModel());
jest.mock('../models/poModel', () => mockModel());
jest.mock('../models/revenueModel', () => mockModel());
jest.mock('../models/revenueInvoiceModel', () => mockModel());
jest.mock('../models/savingModel', () => mockModel());
jest.mock('../models/sharePointModel', () => mockModel());
jest.mock('../models/extensionInvoice', () => mockModel());
jest.mock('../models/missionModel', () => mockModel());
jest.mock('../models/projectModel', () => mockModel());
jest.mock('../models/userModel', () =>
  mockModel({
    beforeCreate: jest.fn(),
    beforeUpdate: jest.fn(),
  })
);
jest.mock('../models/profileModel', () => mockModel());
jest.mock('../models/TeamModel', () => mockModel());
jest.mock('../models/UserTeams', () => mockModel());
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(() => 'hashed-password'),
  hash: jest.fn(() => Promise.resolve('hashed-new-password')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

const Currency = require('../models/currencyModel');
const Customer = require('../models/customerModel');
const Expense = require('../models/expenseModel');
const Forecast = require('../models/forecastModel');
const Invoice = require('../models/invoiceModel');
const PurchaseOrder = require('../models/poModel');
const Revenue = require('../models/revenueModel');
const RevenueInvoice = require('../models/revenueInvoiceModel');
const Saving = require('../models/savingModel');
const SharePoint = require('../models/sharePointModel');
const Mission = require('../models/missionModel');
const ExtensionInvoice = require('../models/extensionInvoice');
const User = require('../models/userModel');
const UserProfile = require('../models/profileModel');
const Team = require('../models/TeamModel');
const UserTeams = require('../models/UserTeams');
const bcrypt = require('bcryptjs');

const currencyController = require('../controllers/currencyController');
const customerController = require('../controllers/customerController');
const expenseController = require('../controllers/expenseController');
const forecastController = require('../controllers/forecastController');
const invoiceController = require('../controllers/invoiceController');
const revenueController = require('../controllers/revenueController');
const revenueInvoiceController = require('../controllers/revenueInvoiceController');
const savingsController = require('../controllers/savingsController');
const sharePointController = require('../controllers/sharePointController');
const extensionInvoiceController = require('../controllers/extensionInvoiceController');
const userController = require('../controllers/userController');
const teamController = require('../controllers/teamController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('additional CRUD controller coverage', () => {
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  describe('currencyController', () => {
    it('creates a currency conversion row', async () => {
      const currency = { id: 1, currency_code: 'EUR' };
      Currency.create.mockResolvedValue(currency);
      const res = mockRes();

      await currencyController.createCurrency({ body: currency }, res);

      expect(Currency.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency_code: 'EUR' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: currency }));
    });

    it('returns 404 when updating a missing currency', async () => {
      Currency.update.mockResolvedValue([0]);
      const res = mockRes();

      await currencyController.updateCurrency({ params: { id: '99' }, body: {} }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Currency not found' });
    });

    it('returns 400 for invalid conversion currencies', async () => {
      Currency.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ conversion_rate: 1 });
      const res = mockRes();

      await currencyController.convertCurrency(
        { query: { fromCurrency: 'BAD', toCurrency: 'EUR', amount: 10, year: 2025 } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid currency code' });
    });

    it('deletes an existing currency row', async () => {
      Currency.destroy.mockResolvedValue(1);
      const res = mockRes();

      await currencyController.deleteCurrency({ params: { id: '1' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Currency deleted successfully' });
    });
  });

  describe('customerController', () => {
    it('creates a customer', async () => {
      const customer = { customer_id: 1, name: 'Acme' };
      Customer.create.mockResolvedValue(customer);
      const res = mockRes();

      await customerController.createCustomer({ body: customer }, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(customer);
    });

    it('returns 404 when deleting a missing customer', async () => {
      Customer.destroy.mockResolvedValue(0);
      const res = mockRes();

      await customerController.deleteCustomer({ params: { id: '9' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Customer not found' });
    });

    it('returns 404 when no customers are associated to a mission', async () => {
      Mission.findByPk.mockResolvedValue({ customers: [] });
      const res = mockRes();

      await customerController.getCustomerByMissionId({ params: { id: '3' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Customer not found' });
    });
  });

  describe('expenseController and forecastController', () => {
    it('returns an expense by id', async () => {
      const expense = { id: 1, expenseAmount: 50 };
      Expense.findByPk.mockResolvedValue(expense);
      const res = mockRes();

      await expenseController.getExpenseById({ params: { id: '1' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expense);
    });

    it('returns 404 when an expense is missing', async () => {
      Expense.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await expenseController.getExpenseById({ params: { id: '404' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Expense not found' });
    });

    it('returns 500 when forecast creation fails', async () => {
      Forecast.create.mockRejectedValue(new Error('db down'));
      const res = mockRes();

      await forecastController.createForecast({ body: { forecastAmount: 10 } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('returns 404 when no forecast rows are updated', async () => {
      Forecast.update.mockResolvedValue([0]);
      const res = mockRes();

      await forecastController.updateForecast({ params: { id: '2' }, body: { value: 1 } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No user Input' });
    });
  });

  describe('invoiceController', () => {
    it('creates a new invoice when no monthly invoice exists', async () => {
      PurchaseOrder.findByPk.mockResolvedValue({
        id: 7,
        poAmount: 1000,
        poPrice: 0,
        update: jest.fn().mockResolvedValue({}),
      });
      Invoice.sum.mockResolvedValue(100);
      Invoice.findOne.mockResolvedValue(null);
      const invoice = { id: 1, poId: 7, invoiceAmount: 200 };
      Invoice.create.mockResolvedValue(invoice);
      const res = mockRes();

      await invoiceController.createInvoice(
        {
          body: {
            poId: 7,
            invoiceAmount: 200,
            forecastAmount: 250,
            invoiceDate: '2025-01-15',
          },
        },
        res
      );

      expect(Invoice.create).toHaveBeenCalledWith(expect.objectContaining({ poId: 7 }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(invoice);
    });

    it('returns 400 when invoice update body has no editable input', async () => {
      const res = mockRes();

      await invoiceController.updateInvoiceById({ params: { id: '1' }, body: {} }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Either invoiceAmount or forecastAmount or invoiceDate are required',
      });
    });

    it('returns 404 when deleting a missing invoice', async () => {
      Invoice.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await invoiceController.deleteInvoiceById({ params: { id: '3' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invoice not found' });
    });
  });

  describe('revenue and revenue invoice controllers', () => {
    it('passes revenue create errors to next', async () => {
      const error = new Error('create failed');
      Revenue.create.mockRejectedValue(error);

      await revenueController.createRevenue({ body: {} }, mockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('returns 404 for a missing revenue', async () => {
      Revenue.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await revenueController.getRevenueById({ params: { id: '99' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Revenue not found.' });
    });

    it('validates revenue invoice creation input', async () => {
      const res = mockRes();

      await revenueInvoiceController.createRevenueInvoice(
        { params: { revenueId: '1' }, body: { forecastRevenue: 10 } },
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'invoiceDate is required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deletes an existing revenue invoice', async () => {
      const invoice = mockRow({ id: 1, revenueId: 2 });
      RevenueInvoice.findByPk.mockResolvedValue(invoice);
      const res = mockRes();

      await revenueInvoiceController.deleteRevenueInvoiceById({ params: { id: '1' } }, res);

      expect(invoice.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('savingsController', () => {
    it('returns 400 when saving creation is missing required values', async () => {
      const res = mockRes();

      await savingsController.createSaving({ params: { revenueId: '1' }, body: {} }, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'either savingDate or savingAmount is required',
      });
    });

    it('updates an existing saving', async () => {
      const saving = mockRow({ id: 1, savingAmount: 10, savingDate: new Date('2025-01-01') });
      Saving.findByPk.mockResolvedValue(saving);
      const res = mockRes();

      await savingsController.updateSavingsById(
        { params: { id: '1' }, body: { savingAmount: 20 } },
        res
      );

      expect(saving.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ savingAmount: 20 }));
    });

    it('returns 404 when savings by revenue id are empty', async () => {
      Saving.findAll.mockResolvedValue([]);
      const res = mockRes();

      await savingsController.getSavingsByRevenueId({ params: { id: '8' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No savings found for the specified revenue ID',
      });
    });
  });

  describe('sharePointController', () => {
    it('updates a sharepoint link', async () => {
      const link = { id: 1, url_link: 'https://example.test/doc' };
      SharePoint.update.mockResolvedValue([1]);
      SharePoint.findByPk.mockResolvedValue(link);
      const res = mockRes();

      await sharePointController.updateSharepointLink({ params: { id: '1' }, body: link }, res);

      expect(res.json).toHaveBeenCalledWith(link);
    });

    it('returns 404 when assigning links to a missing mission', async () => {
      Mission.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await sharePointController.assignLinkToMission(
        { params: { id: '5' }, body: { links: ['https://example.test'] } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Mission not found' });
    });
  });

  describe('extensionInvoiceController', () => {
    it('creates a placeholder extension invoice', async () => {
      const invoice = { id: 1, extensionId: '2', revenueProjection: 0, invoiceDate: null };
      ExtensionInvoice.create.mockResolvedValue(invoice);
      const res = mockRes();

      await extensionInvoiceController.createExtensionInvoice(
        {
          params: { extensionId: '2' },
          body: { revenueProjection: 0, actualRevenue: 0, invoiceDate: '' },
        },
        res,
        next
      );

      expect(ExtensionInvoice.create).toHaveBeenCalledWith({
        extensionId: '2',
        revenueProjection: 0,
        invoiceDate: null,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 404 for missing extension invoice', async () => {
      ExtensionInvoice.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await extensionInvoiceController.getExtensionInvoiceById({ params: { id: '9' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Extension invoice not found.',
      });
    });

    it('passes extension invoice query errors to next', async () => {
      const error = new Error('bad query');
      ExtensionInvoice.findAll.mockRejectedValue(error);

      await extensionInvoiceController.getExtensionInvoices({}, mockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('userController', () => {
    it('rejects users outside the allowed email domain', async () => {
      const res = mockRes();

      await userController.createUser(
        { body: { email: 'person@example.com', username: 'User', password: 'secret' } },
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(User.create).not.toHaveBeenCalled();
    });

    it('returns 404 when a user cannot be found', async () => {
      User.findOne.mockResolvedValue(null);
      const res = mockRes();

      await userController.getUserById({ params: { id: '77' } }, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'User not found.' });
    });

    it('rejects a weak password before hitting the database', async () => {
      const res = mockRes();

      await userController.updatePassword(
        { params: { user_id: '1' }, body: { password: 'Oldpass1!', newPassword: 'weak' } },
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('updates a password after current password validation', async () => {
      User.findOne.mockResolvedValue({ user_id: 1, password: 'stored-hash' });
      User.update.mockResolvedValue([1]);
      bcrypt.compare.mockResolvedValue(true);
      const res = mockRes();

      await userController.updatePassword(
        { params: { user_id: '1' }, body: { password: 'Oldpass1!', newPassword: 'Newpass1!' } },
        res,
        next
      );

      expect(User.update).toHaveBeenCalledWith(
        { password: 'hashed-new-password' },
        { where: { user_id: '1' } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('teamController', () => {
    it('returns 404 when updating a missing team', async () => {
      Team.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await teamController.updateTeam({ params: { id: '10' }, body: {} }, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Team not found.' });
    });

    it('validates user team occupancy limits', async () => {
      UserTeams.findOne.mockResolvedValue({ occupancy: 20 });
      UserProfile.findByPk.mockResolvedValue({ total_occupancy: 30 });
      const res = mockRes();

      await teamController.updateUserTeams(
        { params: { profile_id: '1', team_id: '2' }, body: { occupancy: 101 } },
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Occupancy cannot exceed 100%.',
      });
    });

    it('returns 400 when adding a duplicate user to a team', async () => {
      Team.findByPk.mockResolvedValue({ id: 2 });
      UserProfile.findByPk.mockResolvedValue({ id: 1, total_occupancy: 10 });
      UserTeams.findOne.mockResolvedValue({ profile_id: 1, team_id: 2 });
      const res = mockRes();

      await teamController.addUsersToTeam(
        { params: { teamId: '2' }, body: { userIds: [1] } },
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User 1 already exists in this team.',
      });
    });
  });
});
