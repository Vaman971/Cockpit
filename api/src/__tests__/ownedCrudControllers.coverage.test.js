const { mockModel, mockRow } = require('./helpers/modelMock');

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../models/currencyModel', () => mockModel({ bulkCreate: jest.fn() }));
jest.mock('../models/expenseModel', () => mockModel());
jest.mock('../models/forecastModel', () => mockModel());
jest.mock('../models/userModel', () => mockModel());
jest.mock('../models/opportunityModel', () => mockModel());
jest.mock('../models/projectModel', () => mockModel());
jest.mock('../models/invoiceModel', () => mockModel());
jest.mock('../models/missionModel', () => mockModel());
jest.mock('../models/poModel', () => mockModel());

const Currency = require('../models/currencyModel');
const Expense = require('../models/expenseModel');
const Forecast = require('../models/forecastModel');
const Opportunity = require('../models/opportunityModel');
const Project = require('../models/projectModel');
const Invoice = require('../models/invoiceModel');
const PurchaseOrder = require('../models/poModel');
const logger = require('../utils/logger');

const currencyController = require('../controllers/currencyController');
const expenseController = require('../controllers/expenseController');
const forecastController = require('../controllers/forecastController');
const opportunityController = require('../controllers/opportunityController');
const poController = require('../controllers/poController');

const opportunityAfterUpdate = Opportunity.afterUpdate.mock.calls[0][0];
const purchaseOrderAfterUpdate = PurchaseOrder.afterUpdate.mock.calls[0][0];

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('owned CRUD controllers extended coverage', () => {
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('currencyController', () => {
    it('calculates conversion rates and converted amounts', async () => {
      Currency.findOne
        .mockResolvedValueOnce({ conversion_rate: 2 })
        .mockResolvedValueOnce({ conversion_rate: 5 })
        .mockResolvedValueOnce({ conversion_rate: 4 })
        .mockResolvedValueOnce({ conversion_rate: 10 });

      const rateRes = mockRes();
      await currencyController.getCurrencyConversionRate(
        { query: { fromCurrency: 'usd', toCurrency: 'eur', year: 2025 } },
        rateRes
      );

      expect(Currency.findOne).toHaveBeenNthCalledWith(1, {
        where: { currency_code: 'USD', conversion_year: 2025 },
      });
      expect(rateRes.status).toHaveBeenCalledWith(200);
      expect(rateRes.json).toHaveBeenCalledWith({ toRate: '2.50' });

      const convertRes = mockRes();
      await currencyController.convertCurrency(
        { query: { fromCurrency: 'USD', toCurrency: 'EUR', amount: 20, year: 2025 } },
        convertRes
      );

      expect(convertRes.status).toHaveBeenCalledWith(200);
      expect(convertRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ convertedAmount: 50 })
      );
    });

    it('covers currency CRUD success and missing-row branches', async () => {
      const rows = [{ id: 1, currency_code: 'USD' }];
      Currency.bulkCreate.mockResolvedValue(rows);
      Currency.update.mockResolvedValueOnce([1]).mockResolvedValueOnce([0]);
      Currency.findAll.mockResolvedValue(rows);
      Currency.findByPk.mockResolvedValueOnce(rows[0]).mockResolvedValueOnce(null);
      Currency.destroy.mockResolvedValueOnce(0);

      let res = mockRes();
      await currencyController.bulkCreateCurrencies({ body: rows }, res);
      expect(Currency.bulkCreate).toHaveBeenCalledWith(rows, {
        validate: true,
        ignoreDuplicates: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);

      res = mockRes();
      await currencyController.updateCurrency(
        { params: { id: '1' }, body: { currency_code: 'USD' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(200);

      res = mockRes();
      await currencyController.updateCurrency({ params: { id: '404' }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      res = mockRes();
      await currencyController.getCurrencies({}, res);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Currencies fetched successfully',
        data: rows,
      });

      res = mockRes();
      await currencyController.getCurrencyById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(200);

      res = mockRes();
      await currencyController.getCurrencyById({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      res = mockRes();
      await currencyController.deleteCurrency({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns controller-level currency errors', async () => {
      Currency.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ conversion_rate: 1 });
      let res = mockRes();
      await currencyController.getCurrencyConversionRate(
        { query: { fromCurrency: 'BAD', toCurrency: 'EUR', year: 2025 } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Currency not found for the specified year',
      });

      Currency.findOne.mockRejectedValueOnce(new Error('lookup failed'));
      res = mockRes();
      await currencyController.convertCurrency(
        { query: { fromCurrency: 'USD', toCurrency: 'EUR', amount: 10, year: 2025 } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(500);

      Currency.create.mockRejectedValue(new Error('create failed'));
      res = mockRes();
      await currencyController.createCurrency({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Currency.bulkCreate.mockRejectedValue(new Error('bulk failed'));
      res = mockRes();
      await currencyController.bulkCreateCurrencies({ body: [] }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Currency.update.mockRejectedValue(new Error('update failed'));
      res = mockRes();
      await currencyController.updateCurrency({ params: { id: '1' }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Currency.findAll.mockRejectedValue(new Error('list failed'));
      res = mockRes();
      await currencyController.getCurrencies({}, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Currency.findByPk.mockRejectedValue(new Error('detail failed'));
      res = mockRes();
      await currencyController.getCurrencyById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Currency.destroy.mockRejectedValue(new Error('delete failed'));
      res = mockRes();
      await currencyController.deleteCurrency({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('expenseController', () => {
    it('creates, lists, updates, and returns latest expenses', async () => {
      const expense = { id: 1, expenseAmount: 20 };
      Expense.create.mockResolvedValue(expense);
      Expense.findAll.mockResolvedValue([expense]);
      Expense.update.mockResolvedValue([1]);
      Expense.findByPk.mockResolvedValue(expense);

      let res = mockRes();
      await expenseController.createExpense({ body: expense }, res);
      expect(res.status).toHaveBeenCalledWith(200);

      res = mockRes();
      await expenseController.getExpenses({}, res);
      expect(res.json).toHaveBeenCalledWith([expense]);

      res = mockRes();
      await expenseController.updateExpenseById(
        { params: { id: '1' }, body: { expenseAmount: 25 } },
        res
      );
      expect(Expense.findByPk).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(expense);

      res = mockRes();
      await expenseController.getLatestExpense({}, res);
      expect(Expense.findAll).toHaveBeenLastCalledWith({
        limit: 5,
        order: [['expense_date', 'DESC']],
      });
      expect(res.json).toHaveBeenCalledWith([expense]);
    });

    it('covers expense error and not-found branches', async () => {
      Expense.create.mockRejectedValue(new Error('create failed'));
      let res = mockRes();
      await expenseController.createExpense({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Expense.findAll.mockRejectedValueOnce(new Error('list failed'));
      res = mockRes();
      await expenseController.getExpenses({}, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Expense.findByPk.mockRejectedValue(new Error('detail failed'));
      res = mockRes();
      await expenseController.getExpenseById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Expense.update.mockResolvedValueOnce([0]).mockRejectedValueOnce(new Error('update failed'));
      res = mockRes();
      await expenseController.updateExpenseById({ params: { id: '404' }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      res = mockRes();
      await expenseController.updateExpenseById({ params: { id: '1' }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Expense.findAll.mockRejectedValueOnce(new Error('latest failed'));
      res = mockRes();
      await expenseController.getLatestExpense({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('forecastController', () => {
    it('creates, lists, returns detail, updates, and returns latest forecasts', async () => {
      const forecast = { id: 1, forecastAmount: 100 };
      Forecast.create.mockResolvedValue(forecast);
      Forecast.findAll.mockResolvedValue([forecast]);
      Forecast.findByPk.mockResolvedValue(forecast);
      Forecast.update.mockResolvedValue([1]);

      let res = mockRes();
      await forecastController.createForecast({ body: forecast }, res);
      expect(res.json).toHaveBeenCalledWith(forecast);

      res = mockRes();
      await forecastController.getForecasts({}, res);
      expect(Forecast.findAll).toHaveBeenCalledWith({ order: [['forcast_date', 'DESC']] });

      res = mockRes();
      await forecastController.getForecastById({ params: { id: '1' } }, res);
      expect(res.json).toHaveBeenCalledWith(forecast);

      res = mockRes();
      await forecastController.updateForecast({ params: { id: '1' }, body: { value: 2 } }, res);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Forecast updated successfully',
      });

      res = mockRes();
      await forecastController.getLatestForecasts({}, res);
      expect(Forecast.findAll).toHaveBeenLastCalledWith({
        limit: 5,
        order: [['updated_at', 'DESC']],
      });
    });

    it('covers forecast error and not-found branches', async () => {
      Forecast.findAll.mockRejectedValueOnce(new Error('list failed'));
      let res = mockRes();
      await forecastController.getForecasts({}, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Forecast.findByPk
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error('detail failed'));
      res = mockRes();
      await forecastController.getForecastById({ params: { id: '404' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      res = mockRes();
      await forecastController.getForecastById({ params: { id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Forecast.update.mockRejectedValue(new Error('update failed'));
      res = mockRes();
      await forecastController.updateForecast({ params: { id: '1' }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);

      Forecast.findAll.mockRejectedValueOnce(new Error('latest failed'));
      res = mockRes();
      await forecastController.getLatestForecasts({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('opportunityController', () => {
    it('covers opportunity afterUpdate hook branches', async () => {
      await opportunityAfterUpdate({ changed: () => null });
      expect(Project.findOne).not.toHaveBeenCalled();

      Project.findOne.mockResolvedValueOnce(mockRow({ id: 2 }));
      await opportunityAfterUpdate({
        id: 1,
        status: 'Won',
        ledBy: 7,
        cluster: 'A',
        OpRegion: 'EU',
        Siglum: 'SIG',
        changed: () => ['status'],
        dataValues: {
          id: 1,
          OpDescription: 'Deal',
          ledBy: 7,
          cluster: 'A',
          OpRegion: 'EU',
          Siglum: 'SIG',
        },
      });
      expect(Project.update).toHaveBeenCalledWith(
        expect.objectContaining({ active: true, projectLead: 7 }),
        { where: { oppurtunity_id: 1 }, individualHooks: true }
      );

      Project.findOne.mockResolvedValueOnce(null);
      await opportunityAfterUpdate({
        id: 3,
        status: 'Won',
        changed: () => ['status'],
        dataValues: {
          id: 3,
          OpDescription: 'Fresh deal',
          ledBy: 9,
          cluster: 'B',
          OpRegion: 'NA',
          Siglum: 'NS',
          opportunityType: 'Fixed',
        },
      });
      expect(Project.create).toHaveBeenCalledWith(
        expect.objectContaining({ project_title: 'Fresh deal', oppurtunity_id: 3 })
      );

      Project.findOne.mockResolvedValueOnce(mockRow({ id: 4 }));
      await opportunityAfterUpdate({
        id: 4,
        status: 'Lost',
        ledBy: 1,
        cluster: 'C',
        OpRegion: 'APAC',
        Siglum: 'AS',
        changed: () => ['status'],
        dataValues: { id: 4 },
      });
      expect(Project.update).toHaveBeenCalledWith(expect.objectContaining({ active: false }), {
        where: { oppurtunity_id: 4 },
        individualHooks: true,
      });

      Project.findOne.mockRejectedValueOnce(new Error('hook failed'));
      await opportunityAfterUpdate({
        id: 5,
        status: 'Won',
        changed: () => ['status'],
        dataValues: { id: 5 },
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Error in opportunity afterUpdate hook:',
        expect.any(Error)
      );
    });

    it('passes opportunity controller errors to next', async () => {
      const error = new Error('opportunity failed');
      Opportunity.create.mockRejectedValueOnce(error);
      await opportunityController.createOpportunity({ body: {} }, mockRes(), next);

      Opportunity.findOne.mockRejectedValueOnce(error);
      await opportunityController.getOpportunityById({ params: { id: '1' } }, mockRes(), next);

      Opportunity.findAll.mockRejectedValueOnce(error).mockRejectedValueOnce(error);
      await opportunityController.getOpportunity({}, mockRes(), next);
      await opportunityController.getLatestOpportunities({}, mockRes(), next);

      Opportunity.update.mockRejectedValueOnce(error);
      await opportunityController.updateOpportunity(
        { params: { id: '1' }, body: {} },
        mockRes(),
        next
      );

      expect(next).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledTimes(5);
    });

    it('uses includes and limits for opportunity list handlers', async () => {
      Opportunity.findAll.mockResolvedValue([{ id: 1 }]);

      let res = mockRes();
      await opportunityController.getOpportunity({}, res, next);
      expect(Opportunity.findAll).toHaveBeenCalledWith({
        include: expect.arrayContaining([
          expect.objectContaining({ as: 'ledByUser' }),
          expect.objectContaining({ as: 'supportedByUser' }),
        ]),
      });
      expect(res.status).toHaveBeenCalledWith(200);

      res = mockRes();
      await opportunityController.getLatestOpportunities({}, res, next);
      expect(Opportunity.findAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ limit: 5, order: [['created_at', 'DESC']] })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('poController', () => {
    it('propagates purchase-order currency changes to invoices', async () => {
      const invoices = [
        { update: jest.fn().mockResolvedValue({}) },
        { update: jest.fn().mockResolvedValue({}) },
      ];
      Invoice.findAll.mockResolvedValue(invoices);

      await purchaseOrderAfterUpdate({ dataValues: { id: 8, currencyCode: 'EUR' } });

      expect(Invoice.findAll).toHaveBeenCalledWith({ where: { poId: 8 } });
      expect(invoices[0].update).toHaveBeenCalledWith({ currencyCode: 'EUR' });
      expect(invoices[1].update).toHaveBeenCalledWith({ currencyCode: 'EUR' });

      Invoice.findAll.mockRejectedValueOnce(new Error('invoice lookup failed'));
      await purchaseOrderAfterUpdate({ dataValues: { id: 9, currencyCode: 'USD' } });
      expect(logger.error).toHaveBeenCalledWith(
        'PurchaseOrder afterUpdate hook error:',
        expect.any(Error)
      );
    });

    it('returns latest purchase orders and passes controller errors to next', async () => {
      PurchaseOrder.findAll.mockResolvedValue([{ id: 1 }]);
      const res = mockRes();
      await poController.getLatestPo({}, res, next);
      expect(PurchaseOrder.findAll).toHaveBeenCalledWith({
        include: [expect.objectContaining({ as: 'projectPo' })],
        limit: 5,
        order: [['po_date', 'DESC']],
      });
      expect(res.status).toHaveBeenCalledWith(200);

      const error = new Error('po failed');
      PurchaseOrder.findAll.mockRejectedValueOnce(error).mockRejectedValueOnce(error);
      await poController.getPo({}, mockRes(), next);
      await poController.getLatestPo({}, mockRes(), next);

      PurchaseOrder.findByPk.mockRejectedValueOnce(error);
      await poController.getPoById({ params: { id: '1' } }, mockRes(), next);

      PurchaseOrder.update.mockRejectedValueOnce(error);
      await poController.updatePo({ params: { id: '1' }, body: {} }, mockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledTimes(4);
    });
  });
});
