const mockSequelize = {
  fn: jest.fn((name, ...args) => ({ fn: name, args })),
  col: jest.fn((name) => ({ col: name })),
  literal: jest.fn((value) => ({ literal: value })),
  query: jest.fn(),
};

jest.mock('../db/connection', () => mockSequelize);

jest.mock('../models/forecastModel', () => ({ findAll: jest.fn() }));
jest.mock('../models/poModel', () => ({ findAll: jest.fn() }));
jest.mock('../models/extentionInvoice', () => ({ findAll: jest.fn() }));
jest.mock('../models/extentionModel', () => ({ findAll: jest.fn() }));
jest.mock('../models/invoiceModel', () => ({ findAll: jest.fn() }));
jest.mock('../models/missionModel', () => ({ findAll: jest.fn() }));

const PurchaseOrder = require('../models/poModel');
const InvoiceModel = require('../models/invoiceModel');
const ForecastModel = require('../models/forecastModel');
const ExtentionInvoice = require('../models/extentionInvoice');
const ExtentionModel = require('../models/extentionModel');
const MissionCard = require('../models/missionModel');
const sequelize = require('../db/connection');
const {
  getDeliveryInfo,
  getforecastInfo,
  getRevenueProjectionInfo,
  getRevenueRecognizedInfo,
  getRevenueRecognizedPieChart,
  getForecastAndExtensionData,
  getPoAndInvoiceData,
  getPurchaseOrderPieChart,
  getPurchaseByMissionLeaderGraph,
  getLatestPurchaseOrderProgress,
  getPurchaseInfo,
} = require('../controllers/financeController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeRow = (data) => {
  const values = { ...data };
  const row = {
    dataValues: values,
    get: jest.fn((key) => values[key]),
    setDataValue: jest.fn((key, value) => {
      values[key] = value;
      row[key] = value;
    }),
    ...values,
  };
  return row;
};

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
      statusText: 'rate missing',
      json: jest.fn(),
    })
  );
};

describe('financeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConversionRates({ EUR: 2, USD: 1 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('delivery and planned revenue summaries', () => {
    it('aggregates delivery forecast rows for the previous quarter and fiscal year', async () => {
      ForecastModel.findAll
        .mockResolvedValueOnce([
          makeRow({ month: 1, year: 2026, totalDeliveryForcast: 100, currencyCode: 'EUR' }),
          makeRow({ month: 1, year: 2026, totalDeliveryForcast: 50, currencyCode: 'USD' }),
        ])
        .mockResolvedValueOnce([
          makeRow({
            cluster: 'Aerospace',
            year: 2026,
            totalDeliveryForcast: 30,
            currencyCode: 'EUR',
          }),
        ]);

      const res = makeRes();
      await getDeliveryInfo({ query: { currency: 'USD' } }, res);

      expect(ForecastModel.findAll).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        DeliverySumThisQuarter: [{ month: 1, year: 2026, totalDeliveryForcast: 250 }],
        OverallSum: [{ cluster: 'Aerospace', year: 2026, totalDeliveryForcast: 60 }],
      });
    });

    it('returns 500 when delivery forecast queries fail', async () => {
      ForecastModel.findAll.mockRejectedValue(new Error('forecast failed'));

      const res = makeRes();
      await getDeliveryInfo({ query: {} }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });

    it('aggregates planned revenue for quarter, month, and cluster views', async () => {
      ForecastModel.findAll
        .mockResolvedValueOnce([
          makeRow({ year: 2026, totalRevenueForecast: 100, currencyCode: 'EUR' }),
          makeRow({ year: 2026, totalRevenueForecast: 20, currencyCode: 'USD' }),
        ])
        .mockResolvedValueOnce([
          makeRow({
            year: 2026,
            cluster: 'Defense',
            updatedAt: '2026-01-01',
            totalRevenueForecast: 10,
            currencyCode: 'EUR',
          }),
        ])
        .mockResolvedValueOnce([
          makeRow({ year: 2026, totalRevenueForecast: 5, currencyCode: 'USD' }),
        ]);

      const res = makeRes();
      await getforecastInfo({ query: { currency: 'USD' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ForecastSumThisQuarter: [{ year: 2026, totalRevenueForecast: 220 }],
        OverallSum: [
          {
            year: 2026,
            cluster: 'Defense',
            updatedAt: '2026-01-01',
            totalRevenueForecast: 20,
          },
        ],
        ForecastSumThisMonth: [{ year: 2026, totalRevenueForecast: 5 }],
      });
    });

    it('skips delivery rows when currency conversion is unavailable', async () => {
      mockFailedConversions();
      ForecastModel.findAll
        .mockResolvedValueOnce([
          makeRow({ month: 1, year: 2026, totalDeliveryForcast: 100, currencyCode: 'EUR' }),
        ])
        .mockResolvedValueOnce([
          makeRow({
            cluster: 'Aerospace',
            year: 2026,
            totalDeliveryForcast: 30,
            currencyCode: 'EUR',
          }),
        ]);

      const res = makeRes();
      await getDeliveryInfo({ query: { currency: 'USD' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        DeliverySumThisQuarter: [],
        OverallSum: [],
      });
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching conversion rate:',
        expect.any(Error)
      );
      expect(console.error).toHaveBeenCalledWith('Conversion rate not available for year 2026');
    });

    it('returns 500 when planned revenue queries fail', async () => {
      ForecastModel.findAll.mockRejectedValue(new Error('planned failed'));

      const res = makeRes();
      await getforecastInfo({ query: {} }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });

  describe('revenue projection and recognized summaries', () => {
    it('combines extension and purchase-order projections after conversion', async () => {
      ExtentionInvoice.findAll
        .mockResolvedValueOnce([
          makeRow({ year: 2026, totalRevenueProjection: '100', currencyCode: 'EUR' }),
        ])
        .mockResolvedValueOnce([
          makeRow({
            year: 2026,
            cluster: 'Aerospace',
            totalRevenueProjection: '25',
            currencyCode: 'USD',
          }),
        ]);
      InvoiceModel.findAll
        .mockResolvedValueOnce([
          makeRow({ year: 2026, totalRevenueProjection: '10', currencyCode: 'USD' }),
        ])
        .mockResolvedValueOnce([
          makeRow({
            year: 2026,
            cluster: 'Aerospace',
            totalRevenueProjection: '40',
            currencyCode: 'EUR',
          }),
        ]);

      const res = makeRes();
      await getRevenueProjectionInfo({ query: { currency: 'USD' } }, res);

      expect(ExtentionInvoice.findAll).toHaveBeenCalledTimes(2);
      expect(InvoiceModel.findAll).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        RevenueProjectionThisQuarter: [{ totalRevenueProjection: 210 }],
        OverallSum: [{ cluster: 'Aerospace', totalRevenueProjection: 105 }],
      });
    });

    it('combines recognized revenue totals by quarter and cluster', async () => {
      InvoiceModel.findAll
        .mockResolvedValueOnce([
          makeRow({ year: 2026, totalRevenueRecognized: 50, currencyCode: 'EUR' }),
        ])
        .mockResolvedValueOnce([
          makeRow({
            year: 2026,
            cluster: 'Aerospace',
            totalRevenueRecognized: 20,
            currencyCode: 'USD',
          }),
        ]);

      const res = makeRes();
      await getRevenueRecognizedInfo({ query: { currency: 'USD' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        RevenueRecognizedThisQuarter: [{ totalRevenueRecognized: 100 }],
        OverallSum: [{ cluster: 'Aerospace', totalRevenueRecognized: 20 }],
      });
    });

    it('aggregates recognized revenue pie data by region', async () => {
      PurchaseOrder.findAll.mockResolvedValue([
        makeRow({ year: 2026, range: 'EU', totalAmount: 100, currencyCode: 'EUR' }),
        makeRow({ year: 2026, range: 'EU', totalAmount: 25, currencyCode: 'USD' }),
      ]);

      const res = makeRes();
      await getRevenueRecognizedPieChart({ query: { query: 'region', currency: 'USD' } }, res);

      expect(PurchaseOrder.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ group: ['region', 'currencyCode', 'year'] })
      );
      expect(res.json).toHaveBeenCalledWith([{ range: 'EU', totalAmount: 225 }]);
    });

    it('aggregates recognized revenue pie data by cluster', async () => {
      PurchaseOrder.findAll.mockResolvedValue([
        makeRow({ year: 2026, range: 'Aerospace', totalAmount: 20, currencyCode: 'EUR' }),
        makeRow({ year: 2026, range: 'Aerospace', totalAmount: 10, currencyCode: 'USD' }),
      ]);

      const res = makeRes();
      await getRevenueRecognizedPieChart({ query: { query: 'cluster', currency: 'USD' } }, res);

      expect(PurchaseOrder.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ group: ['cluster', 'year', 'currencyCode'] })
      );
      expect(res.json).toHaveBeenCalledWith([{ range: 'Aerospace', totalAmount: 50 }]);
    });

    it('returns 500 when recognized revenue queries fail', async () => {
      InvoiceModel.findAll.mockRejectedValue(new Error('invoice failed'));

      const res = makeRes();
      await getRevenueRecognizedInfo({ query: {} }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });

    it('returns 500 when projection queries fail', async () => {
      ExtentionInvoice.findAll.mockRejectedValue(new Error('projection failed'));

      const res = makeRes();
      await getRevenueProjectionInfo({ query: {} }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });

    it('returns 500 when recognized pie queries fail', async () => {
      PurchaseOrder.findAll.mockRejectedValue(new Error('pie failed'));

      const res = makeRes();
      await getRevenueRecognizedPieChart({ query: { query: 'cluster' } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('forecast, extension, and purchase timeline data', () => {
    it('merges monthly forecast, invoice, and extension data', async () => {
      ForecastModel.findAll.mockResolvedValue([
        {
          dataValues: {
            year: 2026,
            month: 1,
            deliveryForecast: 10,
            revenueForecast: 20,
            currencyCode: 'EUR',
          },
        },
      ]);
      InvoiceModel.findAll.mockResolvedValue([
        {
          dataValues: {
            year: 2026,
            month: 1,
            revenueRecognized: 5,
            revenueProjection: 7,
            currencyCode: 'USD',
          },
        },
      ]);
      ExtentionInvoice.findAll.mockResolvedValue([
        { dataValues: { year: 2026, month: 1, revenueProjection: 3, currencyCode: 'EUR' } },
      ]);

      const res = makeRes();
      await getForecastAndExtensionData(
        { query: { filter: 'monthly', currencyCode: 'USD', cluster: 'Aerospace' } },
        res
      );

      expect(res.json).toHaveBeenCalledWith([
        {
          year: 2026,
          month: 1,
          deliveryForecast: 20,
          plannedRevenue: 40,
          revenueRecognize: 5,
          revenueProjection: 13,
        },
      ]);
    });

    it('merges yearly forecast, invoice, and extension data', async () => {
      ForecastModel.findAll.mockResolvedValue([
        {
          dataValues: {
            fiscalYear: 2027,
            deliveryForecast: 10,
            revenueForecast: 20,
            currencyCode: 'USD',
          },
        },
      ]);
      InvoiceModel.findAll.mockResolvedValue([
        {
          dataValues: {
            fiscalYear: 2027,
            revenueRecognized: 5,
            revenueProjection: 7,
            currencyCode: 'USD',
          },
        },
      ]);
      ExtentionInvoice.findAll.mockResolvedValue([
        { dataValues: { fiscalYear: 2027, revenueProjection: 3, currencyCode: 'USD' } },
      ]);

      const res = makeRes();
      await getForecastAndExtensionData({ query: { filter: 'yearly', currencyCode: 'USD' } }, res);

      expect(res.json).toHaveBeenCalledWith([
        {
          fiscalYear: 2027,
          deliveryForecast: 10,
          plannedRevenue: 20,
          revenueRecognize: 5,
          revenueProjection: 10,
        },
      ]);
    });

    it('merges quarterly forecast, invoice, and extension data', async () => {
      ForecastModel.findAll.mockResolvedValue([
        {
          dataValues: {
            fiscalYear: 2027,
            fiscalQuarter: 2,
            deliveryForecast: 10,
            revenueForecast: 20,
            currencyCode: 'EUR',
          },
        },
      ]);
      InvoiceModel.findAll.mockResolvedValue([
        {
          dataValues: {
            fiscalYear: 2027,
            fiscalQuarter: 2,
            revenueRecognized: 5,
            revenueProjection: 7,
            currencyCode: 'USD',
          },
        },
      ]);
      ExtentionInvoice.findAll.mockResolvedValue([
        {
          dataValues: {
            fiscalYear: 2027,
            fiscalQuarter: 2,
            revenueProjection: 3,
            currencyCode: 'EUR',
          },
        },
      ]);

      const res = makeRes();
      await getForecastAndExtensionData(
        { query: { filter: 'quarterly', currencyCode: 'USD' } },
        res
      );

      expect(res.json).toHaveBeenCalledWith([
        {
          fiscalYear: 2027,
          fiscalQuarter: 2,
          deliveryForecast: 20,
          plannedRevenue: 40,
          revenueRecognize: 5,
          revenueProjection: 13,
        },
      ]);
    });

    it('returns 500 when forecast-extension data cannot be read', async () => {
      ForecastModel.findAll.mockRejectedValue(new Error('bad forecast'));

      const res = makeRes();
      await getForecastAndExtensionData({ query: { filter: 'monthly' } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching data',
        error: expect.any(Error),
      });
    });
  });

  describe('purchase order dashboard summaries', () => {
    it('aggregates purchase amount and count for the last year', async () => {
      PurchaseOrder.findAll
        .mockResolvedValueOnce([
          makeRow({ year: 2026, totalPurchaseAmount: 100, currencyCode: 'EUR' }),
          makeRow({ year: 2026, totalPurchaseAmount: 30, currencyCode: 'USD' }),
        ])
        .mockResolvedValueOnce([
          makeRow({ monthYear: '2026-1', purchaseCount: 2 }),
          makeRow({ monthYear: '2025-12', purchaseCount: 1 }),
        ]);

      const res = makeRes();
      await getPurchaseInfo({ query: { currency: 'USD' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        purchaseStats: [
          { monthYear: '2025-12', purchaseCount: 1 },
          { monthYear: '2026-1', purchaseCount: 2 },
        ],
        totalPurchaseAmount: '230.00',
        currency: 'USD',
      });
    });

    it('returns top mission leaders by converted purchase totals', async () => {
      MissionCard.findAll.mockResolvedValue([
        { id: 1, missionCardLeader: 'Ada' },
        { id: 2, missionCardLeader: 'Grace' },
      ]);
      PurchaseOrder.findAll.mockResolvedValue([
        makeRow({ year: 2026, poAmount: 50, currencyCode: 'EUR', poMissionId: 1 }),
        makeRow({ year: 2026, poAmount: 70, currencyCode: 'USD', poMissionId: 2 }),
      ]);

      const res = makeRes();
      await getPurchaseByMissionLeaderGraph({ query: { currency: 'USD' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { missionLeader: 'Ada', purchaseTotal: 100 },
        { missionLeader: 'Grace', purchaseTotal: 70 },
      ]);
    });

    it('returns 500 when purchase stats queries fail', async () => {
      PurchaseOrder.findAll.mockRejectedValue(new Error('purchase failed'));

      const res = makeRes();
      await getPurchaseInfo({ query: {} }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('returns 500 when mission leader purchase queries fail', async () => {
      MissionCard.findAll.mockRejectedValue(new Error('missions failed'));

      const res = makeRes();
      await getPurchaseByMissionLeaderGraph({ query: {} }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getPurchaseOrderPieChart', () => {
    it('converts currencies and aggregates purchase order totals by cluster', async () => {
      PurchaseOrder.findAll.mockResolvedValue([
        makeRow({ year: 2026, range: 'Aerospace', totalAmount: 100, currencyCode: 'EUR' }),
        makeRow({ year: 2026, range: 'Aerospace', totalAmount: 50, currencyCode: 'USD' }),
        makeRow({ year: 2026, range: 'Defense', totalAmount: 25, currencyCode: 'USD' }),
      ]);

      const res = makeRes();
      await getPurchaseOrderPieChart({ query: { query: 'cluster', currency: 'USD' } }, res);

      expect(PurchaseOrder.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ group: ['cluster', 'year', 'currencyCode'] })
      );
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(res.json).toHaveBeenCalledWith([
        { range: 'Aerospace', totalAmount: 250 },
        { range: 'Defense', totalAmount: 25 },
      ]);
    });

    it('returns 500 when purchase aggregation fails', async () => {
      PurchaseOrder.findAll.mockRejectedValue(new Error('database offline'));

      const res = makeRes();
      await getPurchaseOrderPieChart({ query: { query: 'cluster' } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('converts currencies and aggregates purchase order totals by region', async () => {
      PurchaseOrder.findAll.mockResolvedValue([
        makeRow({ year: 2026, range: 'EU', totalAmount: 100, currencyCode: 'EUR' }),
        makeRow({ year: 2026, range: 'EU', totalAmount: 25, currencyCode: 'USD' }),
      ]);

      const res = makeRes();
      await getPurchaseOrderPieChart({ query: { query: 'region', currency: 'USD' } }, res);

      expect(PurchaseOrder.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ group: ['region', 'currencyCode', 'year'] })
      );
      expect(res.json).toHaveBeenCalledWith([{ range: 'EU', totalAmount: 225 }]);
    });
  });

  describe('getPoAndInvoiceData', () => {
    it('merges monthly purchase and invoice data with conversion and cumulative totals', async () => {
      PurchaseOrder.findAll.mockResolvedValue([
        makeRow({ year: 2026, month: 1, totalAmount: 100, currencyCode: 'EUR' }),
        makeRow({ year: 2026, month: 1, totalAmount: 50, currencyCode: 'USD' }),
        makeRow({ year: 2026, month: 2, totalAmount: 10, currencyCode: 'USD' }),
      ]);
      InvoiceModel.findAll.mockResolvedValue([
        makeRow({ year: 2026, month: 1, revenueRecognized: 40, currencyCode: 'EUR' }),
        makeRow({ year: 2026, month: 3, revenueRecognized: 30, currencyCode: 'USD' }),
      ]);

      const res = makeRes();
      await getPoAndInvoiceData(
        { query: { filter: 'monthly', currencyCode: 'USD', cluster: 'Aerospace' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          date: '2026-1',
          purchases: 250,
          invoices: 80,
          cumulativePurchases: 250,
          cumulativeInvoices: 80,
        },
        {
          date: '2026-2',
          purchases: 10,
          invoices: 0,
          cumulativePurchases: 260,
          cumulativeInvoices: 80,
        },
        {
          date: '2026-3',
          purchases: 0,
          invoices: 30,
          cumulativePurchases: 260,
          cumulativeInvoices: 110,
        },
      ]);
    });

    it('returns the thrown message when cumulative query work fails', async () => {
      PurchaseOrder.findAll.mockRejectedValue(new Error('bad grouping'));

      const res = makeRes();
      await getPoAndInvoiceData({ query: { filter: 'yearly' } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'bad grouping' });
    });

    it('merges quarterly purchase and invoice data with cumulative totals', async () => {
      PurchaseOrder.findAll.mockResolvedValue([
        makeRow({ fiscalYear: 2027, fiscalQuarter: 1, totalAmount: 100, currencyCode: 'EUR' }),
        makeRow({ fiscalYear: 2027, fiscalQuarter: 2, totalAmount: 10, currencyCode: 'USD' }),
      ]);
      InvoiceModel.findAll.mockResolvedValue([
        makeRow({ fiscalYear: 2027, fiscalQuarter: 1, revenueRecognized: 40, currencyCode: 'USD' }),
        makeRow({ fiscalYear: 2027, fiscalQuarter: 3, revenueRecognized: 30, currencyCode: 'EUR' }),
      ]);

      const res = makeRes();
      await getPoAndInvoiceData({ query: { filter: 'quarterly', currencyCode: 'USD' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          date: '2027-1',
          purchases: 200,
          invoices: 40,
          cumulativePurchases: 200,
          cumulativeInvoices: 40,
        },
        {
          date: '2027-2',
          purchases: 10,
          invoices: 0,
          cumulativePurchases: 210,
          cumulativeInvoices: 40,
        },
        {
          date: '2027-3',
          purchases: 0,
          invoices: 60,
          cumulativePurchases: 210,
          cumulativeInvoices: 100,
        },
      ]);
    });

    it('merges yearly purchase and invoice data with cumulative totals', async () => {
      PurchaseOrder.findAll.mockResolvedValue([
        makeRow({ fiscalYear: 2026, totalAmount: 100, currencyCode: 'EUR' }),
        makeRow({ fiscalYear: 2027, totalAmount: 10, currencyCode: 'USD' }),
      ]);
      InvoiceModel.findAll.mockResolvedValue([
        makeRow({ fiscalYear: 2026, revenueRecognized: 40, currencyCode: 'USD' }),
        makeRow({ fiscalYear: 2028, revenueRecognized: 30, currencyCode: 'USD' }),
      ]);

      const res = makeRes();
      await getPoAndInvoiceData({ query: { filter: 'yearly', currencyCode: 'USD' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          date: '2026',
          purchases: 200,
          invoices: 40,
          cumulativePurchases: 200,
          cumulativeInvoices: 40,
        },
        {
          date: '2027',
          purchases: 10,
          invoices: 0,
          cumulativePurchases: 210,
          cumulativeInvoices: 40,
        },
        {
          date: '2028',
          purchases: 0,
          invoices: 30,
          cumulativePurchases: 210,
          cumulativeInvoices: 70,
        },
      ]);
    });
  });

  describe('getLatestPurchaseOrderProgress', () => {
    it('converts upcoming purchase order amount and price from raw query rows', async () => {
      sequelize.query.mockResolvedValue([
        { poNumber: 'PO-1', poAmount: 100, poPrice: 40, year: 2026, currencyCode: 'EUR' },
        { poNumber: 'PO-2', poAmount: 10, poPrice: 5, year: 2026, currencyCode: 'USD' },
      ]);

      const res = makeRes();
      await getLatestPurchaseOrderProgress({ query: { currency: 'USD' } }, res);

      expect(sequelize.query).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
      expect(res.json).toHaveBeenCalledWith([
        { poNumber: 'PO-1', poAmount: 200, poPrice: 80, year: 2026, currencyCode: 'EUR' },
        { poNumber: 'PO-2', poAmount: 10, poPrice: 5, year: 2026, currencyCode: 'USD' },
      ]);
    });

    it('returns 500 when the raw upcoming purchase order query fails', async () => {
      sequelize.query.mockRejectedValue(new Error('sql failed'));

      const res = makeRes();
      await getLatestPurchaseOrderProgress({ query: {} }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
