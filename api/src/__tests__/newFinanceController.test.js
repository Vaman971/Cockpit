const mockSequelize = {
  fn: jest.fn((name, ...args) => ({ fn: name, args })),
  col: jest.fn((name) => ({ col: name })),
  literal: jest.fn((value) => ({ literal: value })),
};

jest.mock('../db/connection', () => mockSequelize);

jest.mock('../models/extentionModel', () => ({ findAll: jest.fn() }));
jest.mock('../models/extentionInvoice', () => ({ findAll: jest.fn() }));
jest.mock('../models/forecastModel', () => ({ findAll: jest.fn() }));
jest.mock('../models/poModel', () => ({ findAll: jest.fn() }));
jest.mock('../models/invoiceModel', () => ({ findAll: jest.fn() }));
jest.mock('../models/opportunityModel', () => ({ findAll: jest.fn() }));
jest.mock('../utils/logger', () => ({ error: jest.fn() }));

const ExtentionModel = require('../models/extentionModel');
const ExtentionInvoice = require('../models/extentionInvoice');
const ForecastModel = require('../models/forecastModel');
const PurchaseOrder = require('../models/poModel');
const InvoiceModel = require('../models/invoiceModel');
const OpportunityModel = require('../models/opportunityModel');
const logger = require('../utils/logger');
const { getRevenueData } = require('../controllers/newFinanceController');

const makeRes = () => ({
  json: jest.fn(),
});

const row = (data) => ({
  get: jest.fn((key) => data[key]),
  toJSON: jest.fn(() => ({ ...data })),
});

const mockConversionRates = (ratesByCurrency) => {
  global.fetch = jest.fn((url) => {
    const parsedUrl = new URL(url);
    const fromCurrency = parsedUrl.searchParams.get('fromCurrency');
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ toRate: ratesByCurrency[fromCurrency] ?? 1 }),
    });
  });
};

const mockFailedConversions = () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      statusText: 'rate unavailable',
      json: jest.fn(),
    })
  );
};

describe('newFinanceController', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConversionRates({ EUR: 2, USD: 1 });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('getRevenueData', () => {
    it('builds a converted nine-month revenue distribution from all finance sources', async () => {
      ExtentionInvoice.findAll.mockResolvedValue([
        row({ year: 2026, totalExtentionRevenue: 100, currencyCode: 'EUR' }),
      ]);
      ExtentionModel.findAll.mockResolvedValue([
        row({
          id: 1,
          extentionStartDate: '2026-05-01',
          extentionEndDate: '2026-06-30',
          likeliness: 'High',
          revenueProjection: 600,
          currencyCode: 'EUR',
        }),
      ]);
      ForecastModel.findAll.mockResolvedValue([
        row({
          forcastDate: '2026-05-10',
          deliveryForcast: 50,
          currencyCode: 'USD',
        }),
      ]);
      PurchaseOrder.findAll.mockResolvedValue([
        row({
          id: 7,
          poEndDate: '2026-07-31',
          poPrice: 300,
          currencyCode: 'USD',
        }),
      ]);
      OpportunityModel.findAll.mockResolvedValue([
        row({
          MissionStartDate: '2026-05-01',
          MissionEndDate: '2026-06-30',
          MarkedOpp: true,
          status: 'Open',
          ExpectedDealSize: 200,
          currencyCode: 'USD',
        }),
      ]);
      InvoiceModel.findAll.mockResolvedValue([
        row({ invoiceDate: '2026-06-10', forecastAmount: 100 }),
      ]);

      const res = makeRes();
      await getRevenueData(
        { query: { currency: 'USD', cluster: 'Aerospace', region: 'APAC' } },
        res,
        jest.fn()
      );

      const response = res.json.mock.calls[0][0];
      expect(response).toHaveLength(9);
      expect(response[0]).toEqual({
        month: '2026-05',
        high: 600,
        medium: 0,
        low: 0,
        ExpectedDealSize: 100,
        deliveryForcast: 50,
        poConfirmed: 0,
      });
      expect(response[1]).toEqual({
        month: '2026-06',
        high: 600,
        medium: 0,
        low: 0,
        ExpectedDealSize: 100,
        deliveryForcast: 0,
        poConfirmed: 100,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('fromCurrency=EUR&toCurrency=USD&year=2026')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('fromCurrency=EUR&toCurrency=USD&year=2025')
      );
    });

    it('logs and passes errors to next when the revenue query fails', async () => {
      const error = new Error('extension invoice failed');
      ExtentionInvoice.findAll.mockRejectedValue(error);
      const next = jest.fn();

      await getRevenueData({ query: {} }, makeRes(), next);

      expect(logger.error).toHaveBeenCalledWith('getRevenueData error:', error);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('distributes medium and low extensions and uninvoiced purchase orders', async () => {
      ExtentionInvoice.findAll.mockResolvedValue([
        row({ year: 2026, totalExtentionRevenue: 100, currencyCode: 'EUR' }),
        row({ year: 2026, totalExtentionRevenue: 50, currencyCode: 'USD' }),
      ]);
      ExtentionModel.findAll.mockResolvedValue([
        row({
          id: 1,
          extentionStartDate: '2026-04-01',
          extentionEndDate: '2026-05-31',
          likeliness: 'Medium',
          revenueProjection: 200,
          currencyCode: 'USD',
        }),
        row({
          id: 2,
          extentionStartDate: '2026-06-01',
          extentionEndDate: '2026-06-30',
          likeliness: 'Low',
          revenueProjection: 100,
          currencyCode: 'EUR',
        }),
      ]);
      ForecastModel.findAll.mockResolvedValue([
        row({
          forcastDate: '2027-02-10',
          deliveryForcast: 75,
          currencyCode: 'USD',
        }),
      ]);
      PurchaseOrder.findAll.mockResolvedValue([
        row({
          id: 8,
          poEndDate: '2026-05-31',
          poPrice: null,
          currencyCode: 'USD',
        }),
        row({
          id: 9,
          poEndDate: '2026-06-30',
          poPrice: 250,
          currencyCode: 'EUR',
        }),
      ]);
      OpportunityModel.findAll.mockResolvedValue([
        row({
          MissionStartDate: '2027-01-01',
          MissionEndDate: '2027-02-28',
          MarkedOpp: true,
          status: 'Open',
          ExpectedDealSize: 100,
          currencyCode: 'EUR',
        }),
        row({
          MissionStartDate: '2026-05-01',
          MissionEndDate: '2026-05-31',
          MarkedOpp: true,
          status: 'Won',
          ExpectedDealSize: 999,
          currencyCode: 'USD',
        }),
      ]);
      InvoiceModel.findAll.mockResolvedValue([]);

      const res = makeRes();
      await getRevenueData({ query: { currency: 'USD' } }, res, jest.fn());

      const response = res.json.mock.calls[0][0];
      expect(response[0]).toEqual({
        month: '2026-05',
        high: 0,
        medium: 100,
        low: 0,
        ExpectedDealSize: 0,
        deliveryForcast: 0,
        poConfirmed: 0,
      });
      expect(response[1]).toEqual({
        month: '2026-06',
        high: 0,
        medium: 0,
        low: 200,
        ExpectedDealSize: 0,
        deliveryForcast: 0,
        poConfirmed: 500,
      });
      expect(response[8]).toEqual(
        expect.objectContaining({
          month: '2027-01',
          ExpectedDealSize: 100,
        })
      );
      expect(InvoiceModel.findAll).toHaveBeenCalledTimes(2);
    });

    it('logs conversion failures when rates are unavailable', async () => {
      mockFailedConversions();
      ExtentionInvoice.findAll.mockResolvedValue([
        row({ year: 2026, totalExtentionRevenue: 100, currencyCode: 'EUR' }),
      ]);
      ExtentionModel.findAll.mockResolvedValue([
        row({
          id: 1,
          extentionStartDate: '2026-05-01',
          extentionEndDate: '2026-05-31',
          likeliness: 'Unknown',
          revenueProjection: 100,
          currencyCode: 'EUR',
        }),
      ]);
      ForecastModel.findAll.mockResolvedValue([]);
      PurchaseOrder.findAll.mockResolvedValue([]);
      OpportunityModel.findAll.mockResolvedValue([
        row({
          MissionStartDate: '2026-05-01',
          MissionEndDate: '2026-05-31',
          MarkedOpp: true,
          status: 'Open',
          ExpectedDealSize: 100,
          currencyCode: 'EUR',
        }),
      ]);

      const res = makeRes();
      await getRevenueData({ query: { currency: 'USD' } }, res, jest.fn());

      const response = res.json.mock.calls[0][0];
      expect(response[0]).toEqual({
        month: '2026-05',
        high: 0,
        medium: 0,
        low: 0,
        ExpectedDealSize: 0,
        deliveryForcast: 0,
        poConfirmed: 0,
      });
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching conversion rate:',
        expect.any(Error)
      );
      expect(console.error).toHaveBeenCalledWith('Conversion rate not available for year 2026');
      expect(console.error).toHaveBeenCalledWith('Conversion rate not available for year 2025');
    });
  });
});
