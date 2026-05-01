const mockSequelize = {
  query: jest.fn(),
  fn: jest.fn((name, ...args) => ({ fn: name, args })),
  col: jest.fn((name) => ({ col: name })),
  literal: jest.fn((value) => ({ literal: value })),
};

jest.mock('../db/connection', () => mockSequelize);

jest.mock('../models/opportunityModel', () => ({
  findAll: jest.fn(),
  count: jest.fn(),
}));

jest.mock('../models/userModel', () => ({
  findAndCountAll: jest.fn(),
  sequelize: mockSequelize,
}));

jest.mock('../models/projectModel', () => ({
  findAll: jest.fn(),
  count: jest.fn(),
}));

jest.mock('../models/missionModel', () => ({
  findAll: jest.fn(),
  count: jest.fn(),
}));

jest.mock('../models/expenseModel', () => ({
  findAll: jest.fn(),
}));

jest.mock('../models/invoiceModel', () => ({
  findAll: jest.fn(),
}));

jest.mock('../models/poModel', () => ({
  findAll: jest.fn(),
  sum: jest.fn(),
}));

jest.mock('../models/forecastModel', () => ({
  findAll: jest.fn(),
}));

jest.mock('../models/revenueModel', () => ({
  findAll: jest.fn(),
}));

jest.mock('../models/revenueInvoiceModel', () => ({
  findAll: jest.fn(),
}));

const Oppurtunity = require('../models/opportunityModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const MissionCard = require('../models/missionModel');
const Expense = require('../models/expenseModel');
const InvoiceModel = require('../models/invoiceModel');
const PurchaseOrder = require('../models/poModel');
const ForecastModel = require('../models/forecastModel');
const RevenueModel = require('../models/revenueModel');
const revenueInvoiceModel = require('../models/revenueInvoiceModel');
const analytics = require('../controllers/analyticsController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const row = (data) => ({
  dataValues: data,
  ...data,
  get: jest.fn((key) => data[key]),
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('analyticsController basic count endpoints', () => {
  it('oppRegionCount returns opportunities grouped by region', async () => {
    const grouped = [row({ OpRegion: 'EU', count: 2 })];
    Oppurtunity.findAll.mockResolvedValue(grouped);

    const res = mockRes();
    await analytics.oppRegionCount({}, res);

    expect(Oppurtunity.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        group: ['OpRegion'],
        order: [['op_region', 'ASC']],
      })
    );
    expect(res.json).toHaveBeenCalledWith(grouped);
  });

  it('oppRegionCount returns 500 on model failure', async () => {
    Oppurtunity.findAll.mockRejectedValue(new Error('db failed'));

    const res = mockRes();
    await analytics.oppRegionCount({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('totalOpportunityCount combines count and current-quarter count', async () => {
    const quarterRows = [row({ count: 4 })];
    Oppurtunity.count.mockResolvedValue(10);
    Oppurtunity.findAll.mockResolvedValue(quarterRows);

    const res = mockRes();
    await analytics.totalOpportunityCount({}, res);

    expect(Oppurtunity.count).toHaveBeenCalled();
    expect(Oppurtunity.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.any(Array),
        where: expect.objectContaining({ createdAt: expect.any(Object) }),
      })
    );
    expect(res.json).toHaveBeenCalledWith({
      total_opportunities: 10,
      opportunities_lastQuarter: quarterRows,
    });
  });

  it('projectStatusCount returns total and current-quarter project status groups', async () => {
    const allStatus = [row({ status: true, count: 6 })];
    const quarterStatus = [row({ status: true, count: 2 })];
    Project.findAll.mockResolvedValueOnce(allStatus).mockResolvedValueOnce(quarterStatus);

    const res = mockRes();
    await analytics.projectStatusCount({}, res);

    expect(Project.findAll).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({
      projectsByStatus: allStatus,
      projectsByStatusLastQuarter: quarterStatus,
    });
  });

  it('cluster count endpoints use grouped aggregations and handle errors', async () => {
    const opportunityCounts = [row({ cluster: 'A', opportunityCount: 3 })];
    Oppurtunity.findAll.mockResolvedValueOnce(opportunityCounts);

    const opportunityRes = mockRes();
    await analytics.getOpportunityCountByCluster({}, opportunityRes);

    expect(Oppurtunity.findAll).toHaveBeenCalledWith(expect.objectContaining({ group: 'cluster' }));
    expect(opportunityRes.json).toHaveBeenCalledWith(opportunityCounts);

    Project.findAll.mockRejectedValueOnce(new Error('project db'));
    const projectRes = mockRes();
    await analytics.getProjectWonCountByCluster({}, projectRes);

    expect(projectRes.status).toHaveBeenCalledWith(500);
    expect(projectRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('totalUserCount returns the aggregated first row', async () => {
    const summary = row({ total_users: 5, leader_count: 1, reader_count: 3, admin_count: 1 });
    User.findAndCountAll.mockResolvedValue({ rows: [summary] });

    const res = mockRes();
    await analytics.totalUserCount({}, res);

    expect(User.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ attributes: expect.any(Array) })
    );
    expect(res.json).toHaveBeenCalledWith(summary);
  });

  it('mission and project totals return success and failure responses', async () => {
    const statusRows = [row({ status: 'Open', count: 2 })];
    MissionCard.count.mockResolvedValueOnce(7);
    MissionCard.findAll.mockResolvedValueOnce(statusRows);

    const missionRes = mockRes();
    await analytics.getMissionCardCount({}, missionRes);

    expect(missionRes.status).toHaveBeenCalledWith(200);
    expect(missionRes.json).toHaveBeenCalledWith({
      totalMissionCards: 7,
      missionCardStatusCount: statusRows,
    });

    Project.count.mockRejectedValueOnce(new Error('project total failed'));
    const projectRes = mockRes();
    await analytics.totalProjectCount({}, projectRes);

    expect(projectRes.status).toHaveBeenCalledWith(500);
    expect(projectRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});

describe('analyticsController raw sequelize query endpoints', () => {
  it('oppCreatedLastWeek runs a SELECT query with date replacements', async () => {
    const rows = [{ createdAt: '2026-04-24', count: 1 }];
    mockSequelize.query.mockResolvedValue(rows);

    const res = mockRes();
    await analytics.oppCreatedLastWeek({}, res);

    expect(mockSequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('LEFT JOIN oppurtunities'),
      expect.objectContaining({
        replacements: expect.objectContaining({
          endDate: expect.any(String),
          startDate: expect.any(String),
        }),
      })
    );
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('oppWonLastWeek returns 500 when the raw query fails', async () => {
    mockSequelize.query.mockRejectedValue(new Error('raw failed'));

    const res = mockRes();
    await analytics.oppWonLastWeek({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('oppQueryCount builds filtered interval SQL and returns rows', async () => {
    const rows = [{ Year: 2026, MONTH: 4, oppCount: 8, wonCount: 2 }];
    mockSequelize.query.mockResolvedValue(rows);

    const res = mockRes();
    await analytics.oppQueryCount(
      { query: { filter: 'MONTH', cluster: 'NORTH', region: 'EMEA' } },
      res
    );

    expect(mockSequelize.query).toHaveBeenCalledWith(
      expect.stringContaining("AND cluster = 'NORTH'"),
      expect.objectContaining({ type: expect.any(String) })
    );
    expect(mockSequelize.query.mock.calls[0][0]).toContain("AND op_region = 'EMEA'");
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('oppQueryCount uses the YEAR-only branch', async () => {
    mockSequelize.query.mockResolvedValue([{ Year: 2026, oppCount: 4 }]);

    const res = mockRes();
    await analytics.oppQueryCount({ query: { filter: 'YEAR' } }, res);

    expect(mockSequelize.query.mock.calls[0][0]).toContain('GROUP BY');
    expect(mockSequelize.query.mock.calls[0][0]).toContain('YEAR(created_at)');
    expect(mockSequelize.query.mock.calls[0][0]).not.toContain('oppCount.YEAR = wonCount.YEAR');
    expect(res.json).toHaveBeenCalledWith([{ Year: 2026, oppCount: 4 }]);
  });

  it('getLatestOpportunities returns raw upcoming opportunities', async () => {
    const rows = [{ id: 1, name: 'Next deal' }];
    mockSequelize.query.mockResolvedValue(rows);

    const res = mockRes();
    await analytics.getLatestOpportunities({}, res);

    expect(mockSequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('next_contact_date >= CURDATE()'),
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('getExpenseAmount destructures raw totals from two queries', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ totalExpenseAmount: '1200.50' }])
      .mockResolvedValueOnce([{ totalExpenseAmountLastMonth: '300.25' }]);

    const res = mockRes();
    await analytics.getExpenseAmount({}, res);

    expect(mockSequelize.query).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({
      totalExpenseAmount: '1200.50',
      totalExpenseAmountLastMonth: '300.25',
    });
  });

  it('getLatestPurchaseOrders uses current and future date replacements', async () => {
    const rows = [{ poPrice: 2, poAmount: 100 }];
    mockSequelize.query.mockResolvedValue(rows);

    const res = mockRes();
    await analytics.getLatestPurchaseOrders({}, res);

    expect(mockSequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('po_date BETWEEN :currentDate AND :futureDate'),
      expect.objectContaining({
        replacements: {
          currentDate: expect.any(Date),
          futureDate: expect.any(Date),
        },
      })
    );
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('getPurchaseAmount returns raw totals and grouped status counts', async () => {
    const statusCounts = [{ po_status: 'Open', count: '450' }];
    mockSequelize.query
      .mockResolvedValueOnce([{ totalPoAmount: '1500' }])
      .mockResolvedValueOnce([{ totalPoAmountLastQuarter: '400' }])
      .mockResolvedValueOnce([statusCounts]);

    const res = mockRes();
    await analytics.getPurchaseAmount({}, res);

    expect(mockSequelize.query).toHaveBeenCalledTimes(3);
    expect(res.json).toHaveBeenCalledWith({
      totalPoAmount: '1500',
      totalPoAmountLastQuarter: '400',
      statusCounts,
    });
  });

  it('getInvoiceSum returns raw invoice totals and count', async () => {
    const invoiceCount = [{ count: 9 }];
    mockSequelize.query
      .mockResolvedValueOnce([{ totalInvoiceAmount: '3000' }])
      .mockResolvedValueOnce([{ totalInvoiceAmountLastQuarter: '800' }])
      .mockResolvedValueOnce([invoiceCount]);

    const res = mockRes();
    await analytics.getInvoiceSum({}, res);

    expect(res.json).toHaveBeenCalledWith({
      totalInvoiceAmount: '3000',
      totalInvoiceAmountLastQuarter: '800',
      invoiceCount,
    });
  });
});

describe('analyticsController merge and aggregation calculations', () => {
  it('getExpensesAndInvoicesData merges monthly purchase and invoice totals in date order', async () => {
    PurchaseOrder.findAll
      .mockResolvedValueOnce([
        row({ year: 2026, month: 5, totalAmount: 500 }),
        row({ year: 2026, month: 4, totalAmount: 300 }),
      ])
      .mockResolvedValueOnce([{ id: 11 }, { id: 12 }]);
    InvoiceModel.findAll.mockResolvedValueOnce([
      row({ year: 2026, month: 4, totalAmount: 200 }),
      row({ year: 2026, month: 6, totalAmount: 100 }),
    ]);

    const res = mockRes();
    await analytics.getExpensesAndInvoicesData(
      { query: { granularity: 'monthly', cluster: 'A' } },
      res
    );

    expect(PurchaseOrder.findAll).toHaveBeenNthCalledWith(2, { where: { cluster: 'A' } });
    expect(InvoiceModel.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { poId: expect.any(Object) },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { month: '2026-4', purchases: 300, invoices: 200 },
      { month: '2026-5', purchases: 500, invoices: 0 },
      { month: '2026-6', purchases: 0, invoices: 100 },
    ]);
  });

  it('getExpensesAndInvoicesData returns 500 when an aggregate query fails', async () => {
    PurchaseOrder.findAll.mockRejectedValue(new Error('aggregate failed'));

    const res = mockRes();
    await analytics.getExpensesAndInvoicesData({ query: { granularity: 'yearly' } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'aggregate failed' });
  });

  it('getForecastAndRevenueData merges quarterly revenue and forecast totals', async () => {
    RevenueModel.findAll.mockResolvedValueOnce([{ id: 41 }]);
    revenueInvoiceModel.findAll.mockResolvedValueOnce([
      row({
        fiscalYear: 2026,
        fiscalQuarter: 2,
        plannedRevenue: 100,
        actualRevenue: 80,
        forecastRevenue: 110,
      }),
    ]);
    ForecastModel.findAll.mockResolvedValueOnce([
      row({
        fiscalYear: 2026,
        fiscalQuarter: 1,
        deliveryForecast: 10,
        salesForecast: 20,
        revenueForecast: 30,
      }),
      row({
        fiscalYear: 2026,
        fiscalQuarter: 2,
        deliveryForecast: 40,
        salesForecast: 50,
        revenueForecast: 60,
      }),
    ]);

    const res = mockRes();
    await analytics.getForecastAndRevenueData(
      { query: { granularity: 'quarterly', region: 'West' } },
      res
    );

    expect(RevenueModel.findAll).toHaveBeenCalledWith({ where: { region: 'West' } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        month: '2026-1',
        plannedRevenue: 0,
        actualRevenue: 0,
        forecastRevenue: 0,
        deliveryForecast: 10,
        salesForecast: 20,
        revenueForecast: 30,
      },
      {
        month: '2026-2',
        plannedRevenue: 100,
        actualRevenue: 80,
        forecastRevenue: 110,
        deliveryForecast: 40,
        salesForecast: 50,
        revenueForecast: 60,
      },
    ]);
  });

  it('getCummulativeGraphData calculates sorted cumulative purchases and invoices', async () => {
    PurchaseOrder.findAll
      .mockResolvedValueOnce([
        row({ fiscalYear: 2026, fiscalQuarter: 2, totalAmount: '300', Count: 3 }),
        row({ fiscalYear: 2026, fiscalQuarter: 1, totalAmount: '100', Count: 1 }),
      ])
      .mockResolvedValueOnce([{ id: 21 }, { id: 22 }]);
    InvoiceModel.findAll.mockResolvedValueOnce([
      row({ fiscalYear: 2026, fiscalQuarter: 1, totalAmount: '50' }),
      row({ fiscalYear: 2026, fiscalQuarter: 3, totalAmount: '75' }),
    ]);

    const res = mockRes();
    await analytics.getCummulativeGraphData({ query: { granularity: 'quarterly' } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        month: '2026-1',
        purchases: 100,
        count: 1,
        invoices: 50,
        cumulativePurchases: 100,
        cumulativeInvoices: 50,
      },
      {
        month: '2026-2',
        purchases: 300,
        count: 3,
        invoices: 0,
        cumulativePurchases: 400,
        cumulativeInvoices: 50,
      },
      {
        month: '2026-3',
        purchases: 0,
        count: 0,
        invoices: 75,
        cumulativePurchases: 400,
        cumulativeInvoices: 125,
      },
    ]);
  });

  it('getPurchaseGraphAmounts sums purchase amounts by mission leader', async () => {
    MissionCard.findAll.mockResolvedValueOnce([
      { id: 1, missionCardLeader: 'Asha' },
      { id: 2, missionCardLeader: 'Asha' },
      { id: 3, missionCardLeader: 'Ben' },
    ]);
    PurchaseOrder.findAll.mockResolvedValueOnce([
      { poMissionId: 1, poAmount: '100.50' },
      { poMissionId: 2, poAmount: '25' },
      { poMissionId: 3, poAmount: null },
    ]);

    const res = mockRes();
    await analytics.getPurchaseGraphAmounts({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { missionLeader: 'Asha', purchaseTotal: 125.5 },
      { missionLeader: 'Ben', purchaseTotal: 0 },
    ]);
  });

  it('getLatestPoAndInvoiceData totals latest purchase orders and expenses', async () => {
    const latestPurchaseOrders = [
      { poAmount: '100', poPrice: '20' },
      { poAmount: null, poPrice: '5.5' },
    ];
    PurchaseOrder.findAll.mockResolvedValueOnce(latestPurchaseOrders);
    Expense.findAll.mockResolvedValueOnce([{ expenseAmount: '7.25' }, { expenseAmount: null }]);

    const res = mockRes();
    await analytics.getLatestPoAndInvoiceData({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalPOAmount: 100,
      totalPOPrice: 25.5,
      totalExpense: 7.25,
      latestPurchaseOrders,
    });
  });

  it('getPurchaseStats normalizes and sorts month buckets', async () => {
    const purchaseAmount = [row({ totalPurchaseAmount: 900 })];
    PurchaseOrder.findAll
      .mockResolvedValueOnce(purchaseAmount)
      .mockResolvedValueOnce([
        row({ monthYear: '2026-5', purchaseCount: 3 }),
        row({ monthYear: '2026-4', purchaseCount: 1 }),
      ]);

    const res = mockRes();
    await analytics.getPurchaseStats({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      purchaseStats: [
        { monthYear: '2026-4', purchaseCount: 1 },
        { monthYear: '2026-5', purchaseCount: 3 },
      ],
      purchaseAmount,
    });
  });
});

describe('analyticsController revenue and forecast card endpoints', () => {
  it('getTotalPurchase returns cluster totals with a zero fallback total', async () => {
    const purchaseByCategory = [row({ range: 'A', totalAmount: 100 })];
    PurchaseOrder.sum.mockResolvedValue(null);
    PurchaseOrder.findAll.mockResolvedValue(purchaseByCategory);

    const res = mockRes();
    await analytics.getTotalPurchase({ query: { query: 'cluster' } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalPurchase: 0,
      purchaseByCategory,
    });
  });

  it('getTotalRevenue returns region totals by default', async () => {
    const revenueRows = [row({ range: 'North', totalAmount: 600 })];
    RevenueModel.findAll.mockResolvedValue(revenueRows);

    const res = mockRes();
    await analytics.getTotalRevenue({ query: {} }, res);

    expect(RevenueModel.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ group: ['region'] })
    );
    expect(res.json).toHaveBeenCalledWith(revenueRows);
  });

  it('getForecastSum returns overall and previous-quarter sums', async () => {
    const overall = [row({ totalRevenueForcast: 1000 })];
    const quarter = [row({ totalRevenueForcast: 250 })];
    ForecastModel.findAll.mockResolvedValueOnce(overall).mockResolvedValueOnce(quarter);

    const res = mockRes();
    await analytics.getForecastSum({}, res);

    expect(ForecastModel.findAll).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({ OverallSum: overall, lastQuarterSum: quarter });
  });

  it('getRevenueSum returns overall and quarter revenue summaries', async () => {
    const quarter = [row({ totalActualRevenue: 200 })];
    const overall = [row({ totalActualRevenue: 1000 })];
    RevenueModel.findAll.mockResolvedValueOnce(quarter).mockResolvedValueOnce(overall);

    const res = mockRes();
    await analytics.getRevenueSum({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ OverallSum: overall, QuarterSum: quarter });
  });

  it('planned, actual, delivery, sales, and forecast card endpoints return their aggregate payloads', async () => {
    const first = [row({ total: 1 })];
    const second = [row({ cluster: 'A', total: 2 })];
    const third = [row({ total: 3 })];
    revenueInvoiceModel.findAll
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second)
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
    ForecastModel.findAll
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second)
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second)
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second)
      .mockResolvedValueOnce(third);

    const plannedRes = mockRes();
    await analytics.getPlannedData({}, plannedRes);
    expect(plannedRes.status).toHaveBeenCalledWith(200);
    expect(plannedRes.json).toHaveBeenCalledWith({
      PlannedSumThisQuarter: first,
      OverallSum: second,
    });

    const actualRes = mockRes();
    await analytics.getActualData({}, actualRes);
    expect(actualRes.status).toHaveBeenCalledWith(200);
    expect(actualRes.json).toHaveBeenCalledWith({
      ActualSumThisQuarter: first,
      OverallSum: second,
    });

    const deliveryRes = mockRes();
    await analytics.getDeliveryData({}, deliveryRes);
    expect(deliveryRes.status).toHaveBeenCalledWith(200);
    expect(deliveryRes.json).toHaveBeenCalledWith({
      DeliverySumThisQuarter: first,
      OverallSum: second,
    });

    const salesRes = mockRes();
    await analytics.getSalesData({}, salesRes);
    expect(salesRes.status).toHaveBeenCalledWith(200);
    expect(salesRes.json).toHaveBeenCalledWith({
      SalesSumThisQuarter: first,
      OverallSum: second,
    });

    const forecastRes = mockRes();
    await analytics.getforecastData({}, forecastRes);
    expect(forecastRes.status).toHaveBeenCalledWith(200);
    expect(forecastRes.json).toHaveBeenCalledWith({
      ForecastSumThisQuarter: first,
      OverallSum: second,
      ForecastSumThisMonth: third,
    });
  });

  it('getPlannedData returns 500 when revenue invoice aggregation fails', async () => {
    revenueInvoiceModel.findAll.mockRejectedValueOnce(new Error('planned failed'));

    const res = mockRes();
    await analytics.getPlannedData({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});

describe('analyticsController list endpoints', () => {
  it('returns latest expenses, forecasts, mission leaders, and PO excel data', async () => {
    const expenses = [row({ id: 1 })];
    const forecasts = [row({ id: 2 })];
    const topMissionLeaders = [row({ mission_card_leader: 9, total_missions: 3 })];
    const invoicesMonths = [
      { month: 5, year: 2026 },
      { month: 4, year: 2026 },
    ];
    const purchaseOrders = [row({ id: 10 })];

    Expense.findAll.mockResolvedValueOnce(expenses);
    ForecastModel.findAll.mockResolvedValueOnce(forecasts);
    MissionCard.count.mockResolvedValueOnce(2);
    MissionCard.findAll.mockResolvedValueOnce(topMissionLeaders);
    InvoiceModel.findAll.mockResolvedValueOnce(invoicesMonths);
    PurchaseOrder.findAll.mockResolvedValueOnce(purchaseOrders);

    const expensesRes = mockRes();
    await analytics.getLatestExpenses({}, expensesRes);
    expect(expensesRes.status).toHaveBeenCalledWith(200);
    expect(expensesRes.json).toHaveBeenCalledWith(expenses);

    const forecastsRes = mockRes();
    await analytics.getLatestForecastsByDate({}, forecastsRes);
    expect(forecastsRes.json).toHaveBeenCalledWith(forecasts);

    const leadersRes = mockRes();
    await analytics.getMissionLeaderCount({}, leadersRes);
    expect(leadersRes.status).toHaveBeenCalledWith(200);
    expect(leadersRes.json).toHaveBeenCalledWith({
      totalMissionLeaders: 2,
      topMissionLeaders,
    });

    const excelRes = mockRes();
    await analytics.getPoExcelData({}, excelRes);
    expect(excelRes.status).toHaveBeenCalledWith(200);
    expect(excelRes.json).toHaveBeenCalledWith(purchaseOrders);
  });

  it('getPoExcelData returns the raw error message on failure', async () => {
    InvoiceModel.findAll.mockRejectedValueOnce(new Error('excel failed'));

    const res = mockRes();
    await analytics.getPoExcelData({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'excel failed' });
  });
});

describe('analyticsController additional branch coverage', () => {
  it('covers remaining simple success and error branches', async () => {
    const assertInternalServerError = async (
      handler,
      setup,
      body = { error: 'Internal server error' }
    ) => {
      setup();
      const res = mockRes();
      await handler({ query: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(body);
      jest.clearAllMocks();
    };

    const projectCounts = [row({ cluster: 'B', projectCount: 4 })];
    Project.findAll.mockResolvedValueOnce(projectCounts);
    const projectWonRes = mockRes();
    await analytics.getProjectWonCountByCluster({}, projectWonRes);
    expect(projectWonRes.json).toHaveBeenCalledWith(projectCounts);
    jest.clearAllMocks();

    Project.count.mockResolvedValueOnce(12);
    const totalProjectRes = mockRes();
    await analytics.totalProjectCount({}, totalProjectRes);
    expect(totalProjectRes.json).toHaveBeenCalledWith({ total_projects: 12 });
    jest.clearAllMocks();

    await assertInternalServerError(analytics.getOpportunityCountByCluster, () => {
      Oppurtunity.findAll.mockRejectedValueOnce(new Error('cluster failed'));
    });
    await assertInternalServerError(analytics.projectStatusCount, () => {
      Project.findAll.mockRejectedValueOnce(new Error('status failed'));
    });
    await assertInternalServerError(analytics.totalOpportunityCount, () => {
      Oppurtunity.count.mockRejectedValueOnce(new Error('count failed'));
    });
    await assertInternalServerError(analytics.oppCreatedLastWeek, () => {
      mockSequelize.query.mockRejectedValueOnce(new Error('created failed'));
    });
    await assertInternalServerError(analytics.oppQueryCount, () => {
      mockSequelize.query.mockRejectedValueOnce(new Error('opp query failed'));
    });
    await assertInternalServerError(
      analytics.totalUserCount,
      () => {
        User.findAndCountAll.mockRejectedValueOnce(new Error('users failed'));
      },
      { error: 'Internal Server Error' }
    );
    await assertInternalServerError(
      analytics.getMissionCardCount,
      () => {
        MissionCard.count.mockRejectedValueOnce(new Error('mission count failed'));
      },
      { message: 'mission count failed' }
    );
    await assertInternalServerError(analytics.getMissionLeaderCount, () => {
      MissionCard.count.mockRejectedValueOnce(new Error('leaders failed'));
    });
    await assertInternalServerError(analytics.getLatestOpportunities, () => {
      mockSequelize.query.mockRejectedValueOnce(new Error('latest opp failed'));
    });
    await assertInternalServerError(analytics.getExpenseAmount, () => {
      mockSequelize.query.mockRejectedValueOnce(new Error('expense raw failed'));
    });
    await assertInternalServerError(analytics.getLatestPurchaseOrders, () => {
      mockSequelize.query.mockRejectedValueOnce(new Error('latest po raw failed'));
    });
    await assertInternalServerError(analytics.getTotalPurchase, () => {
      PurchaseOrder.sum.mockRejectedValueOnce(new Error('total purchase failed'));
    });
    await assertInternalServerError(analytics.getTotalRevenue, () => {
      RevenueModel.findAll.mockRejectedValueOnce(new Error('total revenue failed'));
    });
    await assertInternalServerError(analytics.getPurchaseGraphAmounts, () => {
      MissionCard.findAll.mockRejectedValueOnce(new Error('graph failed'));
    });
    await assertInternalServerError(analytics.getPurchaseStats, () => {
      PurchaseOrder.findAll.mockRejectedValueOnce(new Error('stats failed'));
    });
    await assertInternalServerError(analytics.getLatestExpenses, () => {
      Expense.findAll.mockRejectedValueOnce(new Error('latest expenses failed'));
    });
    await assertInternalServerError(analytics.getLatestPoAndInvoiceData, () => {
      PurchaseOrder.findAll.mockRejectedValueOnce(new Error('latest combined failed'));
    });
    await assertInternalServerError(analytics.getLatestForecastsByDate, () => {
      ForecastModel.findAll.mockRejectedValueOnce(new Error('latest forecasts failed'));
    });
    await assertInternalServerError(analytics.getForecastSum, () => {
      ForecastModel.findAll.mockRejectedValueOnce(new Error('forecast sum failed'));
    });
    await assertInternalServerError(analytics.getPurchaseAmount, () => {
      mockSequelize.query.mockRejectedValueOnce(new Error('purchase amount failed'));
    });
    await assertInternalServerError(analytics.getInvoiceSum, () => {
      mockSequelize.query.mockRejectedValueOnce(new Error('invoice sum failed'));
    });
    await assertInternalServerError(
      analytics.getRevenueSum,
      () => {
        RevenueModel.findAll.mockRejectedValueOnce(new Error('revenue sum failed'));
      },
      { message: 'Internal Server Error' }
    );
    await assertInternalServerError(
      analytics.getActualData,
      () => {
        revenueInvoiceModel.findAll.mockRejectedValueOnce(new Error('actual failed'));
      },
      { message: 'Internal Server Error' }
    );
    await assertInternalServerError(
      analytics.getDeliveryData,
      () => {
        ForecastModel.findAll.mockRejectedValueOnce(new Error('delivery failed'));
      },
      { message: 'Internal Server Error' }
    );
    await assertInternalServerError(
      analytics.getSalesData,
      () => {
        ForecastModel.findAll.mockRejectedValueOnce(new Error('sales failed'));
      },
      { message: 'Internal Server Error' }
    );
    await assertInternalServerError(
      analytics.getforecastData,
      () => {
        ForecastModel.findAll.mockRejectedValueOnce(new Error('forecast card failed'));
      },
      { message: 'Internal Server Error' }
    );
  });

  it('covers yearly expense/invoice merging and unfiltered PO lookup', async () => {
    PurchaseOrder.findAll
      .mockResolvedValueOnce([
        row({ fiscalYear: 2027, totalAmount: 700 }),
        row({ fiscalYear: 2026, totalAmount: 400 }),
      ])
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    InvoiceModel.findAll.mockResolvedValueOnce([
      row({ fiscalYear: 2026, totalAmount: 150 }),
      row({ fiscalYear: 2028, totalAmount: 50 }),
    ]);

    const res = mockRes();
    await analytics.getExpensesAndInvoicesData({ query: { granularity: 'yearly' } }, res);

    expect(PurchaseOrder.findAll).toHaveBeenNthCalledWith(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { month: '2026', purchases: 400, invoices: 150 },
      { month: '2027', purchases: 700, invoices: 0 },
      { month: '2028', purchases: 0, invoices: 50 },
    ]);
  });

  it('covers quarterly expense/invoice merging with combined cluster and region filters', async () => {
    PurchaseOrder.findAll
      .mockResolvedValueOnce([
        row({ fiscalYear: 2027, fiscalQuarter: 3, totalAmount: 900 }),
        row({ fiscalYear: 2026, fiscalQuarter: 4, totalAmount: 500 }),
      ])
      .mockResolvedValueOnce([{ id: 3 }]);
    InvoiceModel.findAll.mockResolvedValueOnce([
      row({ fiscalYear: 2026, fiscalQuarter: 2, totalAmount: 120 }),
    ]);

    const res = mockRes();
    await analytics.getExpensesAndInvoicesData(
      {
        query: { granularity: 'quarterly', cluster: 'A', region: 'East' },
      },
      res
    );

    expect(PurchaseOrder.findAll).toHaveBeenNthCalledWith(2, {
      where: { cluster: 'A', region: 'East' },
    });
    expect(res.json).toHaveBeenCalledWith([
      { month: '2026-2', purchases: 0, invoices: 120 },
      { month: '2026-4', purchases: 500, invoices: 0 },
      { month: '2027-3', purchases: 900, invoices: 0 },
    ]);
  });

  it('covers yearly forecast/revenue merging with unfiltered revenue lookup', async () => {
    RevenueModel.findAll.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    revenueInvoiceModel.findAll.mockResolvedValueOnce([
      row({ fiscalYear: 2027, plannedRevenue: 50, actualRevenue: 40, forecastRevenue: 60 }),
    ]);
    ForecastModel.findAll.mockResolvedValueOnce([
      row({ fiscalYear: 2026, deliveryForecast: 10, salesForecast: 20, revenueForecast: 30 }),
      row({ fiscalYear: 2027, deliveryForecast: 1, salesForecast: 2, revenueForecast: 3 }),
    ]);

    const res = mockRes();
    await analytics.getForecastAndRevenueData({ query: { granularity: 'yearly' } }, res);

    expect(RevenueModel.findAll).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        month: '2026',
        plannedRevenue: 0,
        actualRevenue: 0,
        forecastRevenue: 0,
        deliveryForecast: 10,
        salesForecast: 20,
        revenueForecast: 30,
      },
      {
        month: '2027',
        plannedRevenue: 50,
        actualRevenue: 40,
        forecastRevenue: 60,
        deliveryForecast: 1,
        salesForecast: 2,
        revenueForecast: 3,
      },
    ]);
  });

  it('covers monthly forecast/revenue merging with cluster and combined filters plus errors', async () => {
    RevenueModel.findAll.mockResolvedValueOnce([{ id: 5 }]);
    revenueInvoiceModel.findAll.mockResolvedValueOnce([
      row({ year: 2026, month: 5, plannedRevenue: 90, actualRevenue: 80, forecastRevenue: 100 }),
    ]);
    ForecastModel.findAll.mockResolvedValueOnce([
      row({ year: 2026, month: 4, deliveryForecast: 3, salesForecast: 4, revenueForecast: 5 }),
    ]);

    const clusterRes = mockRes();
    await analytics.getForecastAndRevenueData(
      { query: { granularity: 'monthly', cluster: 'South' } },
      clusterRes
    );
    expect(RevenueModel.findAll).toHaveBeenCalledWith({ where: { cluster: 'South' } });
    expect(clusterRes.json).toHaveBeenCalledWith([
      {
        month: '2026-4',
        plannedRevenue: 0,
        actualRevenue: 0,
        forecastRevenue: 0,
        deliveryForecast: 3,
        salesForecast: 4,
        revenueForecast: 5,
      },
      {
        month: '2026-5',
        plannedRevenue: 90,
        actualRevenue: 80,
        forecastRevenue: 100,
        deliveryForecast: 0,
        salesForecast: 0,
        revenueForecast: 0,
      },
    ]);

    jest.clearAllMocks();
    RevenueModel.findAll.mockResolvedValueOnce([{ id: 6 }]);
    revenueInvoiceModel.findAll.mockResolvedValueOnce([]);
    ForecastModel.findAll.mockResolvedValueOnce([]);
    const combinedRes = mockRes();
    await analytics.getForecastAndRevenueData(
      { query: { granularity: 'monthly', cluster: 'South', region: 'West' } },
      combinedRes
    );
    expect(RevenueModel.findAll).toHaveBeenCalledWith({
      where: { cluster: 'South', region: 'West' },
    });
    expect(combinedRes.json).toHaveBeenCalledWith([]);

    jest.clearAllMocks();
    RevenueModel.findAll.mockRejectedValueOnce(new Error('forecast revenue failed'));
    const errorRes = mockRes();
    await analytics.getForecastAndRevenueData({ query: { granularity: 'monthly' } }, errorRes);
    expect(errorRes.status).toHaveBeenCalledWith(500);
    expect(errorRes.json).toHaveBeenCalledWith({ error: 'forecast revenue failed' });
  });

  it('covers cumulative yearly and monthly graph branches plus errors', async () => {
    PurchaseOrder.findAll
      .mockResolvedValueOnce([
        row({ fiscalYear: 2027, totalAmount: '200', Count: 2 }),
        row({ fiscalYear: 2026, totalAmount: '100', Count: 1 }),
      ])
      .mockResolvedValueOnce([{ id: 1 }]);
    InvoiceModel.findAll.mockResolvedValueOnce([
      row({ fiscalYear: 2026, totalAmount: '40' }),
      row({ fiscalYear: 2028, totalAmount: '60' }),
    ]);

    const yearlyRes = mockRes();
    await analytics.getCummulativeGraphData(
      { query: { granularity: 'yearly', region: 'East' } },
      yearlyRes
    );
    expect(PurchaseOrder.findAll).toHaveBeenNthCalledWith(2, { where: { region: 'East' } });
    expect(yearlyRes.json).toHaveBeenCalledWith([
      {
        month: '2026',
        purchases: 100,
        count: 1,
        invoices: 40,
        cumulativePurchases: 100,
        cumulativeInvoices: 40,
      },
      {
        month: '2027',
        purchases: 200,
        count: 2,
        invoices: 0,
        cumulativePurchases: 300,
        cumulativeInvoices: 40,
      },
      {
        month: '2028',
        purchases: 0,
        count: 0,
        invoices: 60,
        cumulativePurchases: 300,
        cumulativeInvoices: 100,
      },
    ]);

    jest.clearAllMocks();
    PurchaseOrder.findAll
      .mockResolvedValueOnce([
        row({ year: 2027, month: 1, totalAmount: '80', Count: 1 }),
        row({ year: 2026, month: 12, totalAmount: '20', Count: 1 }),
      ])
      .mockResolvedValueOnce([{ id: 7 }]);
    InvoiceModel.findAll.mockResolvedValueOnce([row({ year: 2026, month: 11, totalAmount: '10' })]);
    const monthlyRes = mockRes();
    await analytics.getCummulativeGraphData(
      { query: { granularity: 'monthly', cluster: 'A', region: 'East' } },
      monthlyRes
    );
    expect(PurchaseOrder.findAll).toHaveBeenNthCalledWith(2, {
      where: { cluster: 'A', region: 'East' },
    });
    expect(monthlyRes.json).toHaveBeenCalledWith([
      {
        month: '2026-11',
        purchases: 0,
        count: 0,
        invoices: 10,
        cumulativePurchases: 0,
        cumulativeInvoices: 10,
      },
      {
        month: '2026-12',
        purchases: 20,
        count: 1,
        invoices: 0,
        cumulativePurchases: 20,
        cumulativeInvoices: 10,
      },
      {
        month: '2027-1',
        purchases: 80,
        count: 1,
        invoices: 0,
        cumulativePurchases: 100,
        cumulativeInvoices: 10,
      },
    ]);

    jest.clearAllMocks();
    PurchaseOrder.findAll.mockRejectedValueOnce(new Error('cumulative failed'));
    const errorRes = mockRes();
    await analytics.getCummulativeGraphData({ query: { granularity: 'monthly' } }, errorRes);
    expect(errorRes.status).toHaveBeenCalledWith(500);
    expect(errorRes.json).toHaveBeenCalledWith({ error: 'cumulative failed' });
  });

  it('covers cluster revenue and region purchase grouping branches', async () => {
    const revenueByCluster = [row({ range: 'A', totalAmount: 50 })];
    RevenueModel.findAll.mockResolvedValueOnce(revenueByCluster);
    const revenueRes = mockRes();
    await analytics.getTotalRevenue({ query: { query: 'cluster' } }, revenueRes);
    expect(RevenueModel.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ group: ['cluster'] })
    );
    expect(revenueRes.json).toHaveBeenCalledWith(revenueByCluster);

    jest.clearAllMocks();
    const purchaseByRegion = [row({ range: 'East', totalAmount: 75 })];
    PurchaseOrder.sum.mockResolvedValueOnce(75);
    PurchaseOrder.findAll.mockResolvedValueOnce(purchaseByRegion);
    const purchaseRes = mockRes();
    await analytics.getTotalPurchase({ query: {} }, purchaseRes);
    expect(PurchaseOrder.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ group: ['region'] })
    );
    expect(purchaseRes.json).toHaveBeenCalledWith({
      totalPurchase: 75,
      purchaseByCategory: purchaseByRegion,
    });
  });

  it('covers remaining date-quarter switch variants and raw success branch', async () => {
    const dates = ['2026-02-15T00:00:00Z', '2026-08-15T00:00:00Z', '2026-11-15T00:00:00Z'];

    try {
      jest.useFakeTimers();

      for (const date of dates) {
        jest.setSystemTime(new Date(date));

        Project.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
        const statusRes = mockRes();
        await analytics.projectStatusCount({}, statusRes);
        expect(statusRes.json).toHaveBeenCalledWith({
          projectsByStatus: [],
          projectsByStatusLastQuarter: [],
        });

        Oppurtunity.count.mockResolvedValueOnce(0);
        Oppurtunity.findAll.mockResolvedValueOnce([]);
        const opportunityRes = mockRes();
        await analytics.totalOpportunityCount({}, opportunityRes);
        expect(opportunityRes.json).toHaveBeenCalledWith({
          total_opportunities: 0,
          opportunities_lastQuarter: [],
        });

        mockSequelize.query
          .mockResolvedValueOnce([{ totalPoAmount: 1 }])
          .mockResolvedValueOnce([{ totalPoAmountLastQuarter: 2 }])
          .mockResolvedValueOnce([[{ po_status: 'Open', count: 3 }]]);
        const purchaseAmountRes = mockRes();
        await analytics.getPurchaseAmount({}, purchaseAmountRes);
        expect(purchaseAmountRes.json).toHaveBeenCalledWith({
          totalPoAmount: 1,
          totalPoAmountLastQuarter: 2,
          statusCounts: [{ po_status: 'Open', count: 3 }],
        });

        mockSequelize.query
          .mockResolvedValueOnce([{ totalInvoiceAmount: 4 }])
          .mockResolvedValueOnce([{ totalInvoiceAmountLastQuarter: 5 }])
          .mockResolvedValueOnce([[{ count: 6 }]]);
        const invoiceRes = mockRes();
        await analytics.getInvoiceSum({}, invoiceRes);
        expect(invoiceRes.json).toHaveBeenCalledWith({
          totalInvoiceAmount: 4,
          totalInvoiceAmountLastQuarter: 5,
          invoiceCount: [{ count: 6 }],
        });

        RevenueModel.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
        const revenueRes = mockRes();
        await analytics.getRevenueSum({}, revenueRes);
        expect(revenueRes.status).toHaveBeenCalledWith(200);

        revenueInvoiceModel.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
        const plannedRes = mockRes();
        await analytics.getPlannedData({}, plannedRes);
        expect(plannedRes.status).toHaveBeenCalledWith(200);

        revenueInvoiceModel.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
        const actualRes = mockRes();
        await analytics.getActualData({}, actualRes);
        expect(actualRes.status).toHaveBeenCalledWith(200);

        ForecastModel.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
        const deliveryRes = mockRes();
        await analytics.getDeliveryData({}, deliveryRes);
        expect(deliveryRes.status).toHaveBeenCalledWith(200);

        ForecastModel.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
        const salesRes = mockRes();
        await analytics.getSalesData({}, salesRes);
        expect(salesRes.status).toHaveBeenCalledWith(200);

        ForecastModel.findAll
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        const forecastRes = mockRes();
        await analytics.getforecastData({}, forecastRes);
        expect(forecastRes.status).toHaveBeenCalledWith(200);

        ForecastModel.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
        const forecastSumRes = mockRes();
        await analytics.getForecastSum({}, forecastSumRes);
        expect(forecastSumRes.json).toHaveBeenCalledWith({
          OverallSum: [],
          lastQuarterSum: [],
        });

        jest.clearAllMocks();
      }

      const wonRows = [{ updatedAt: '2026-05-01', count: 1 }];
      mockSequelize.query.mockResolvedValueOnce(wonRows);
      const wonRes = mockRes();
      await analytics.oppWonLastWeek({}, wonRes);
      expect(wonRes.json).toHaveBeenCalledWith(wonRows);
    } finally {
      jest.useRealTimers();
    }
  });

  it('covers region-only PO lookup, cluster-only cumulative lookup, and PO excel year sorting', async () => {
    PurchaseOrder.findAll
      .mockResolvedValueOnce([row({ year: 2026, month: 5, totalAmount: 10 })])
      .mockResolvedValueOnce([{ id: 9 }]);
    InvoiceModel.findAll.mockResolvedValueOnce([]);

    const expensesRes = mockRes();
    await analytics.getExpensesAndInvoicesData(
      { query: { granularity: 'monthly', region: 'North' } },
      expensesRes
    );
    expect(PurchaseOrder.findAll).toHaveBeenNthCalledWith(2, { where: { region: 'North' } });
    expect(expensesRes.status).toHaveBeenCalledWith(200);

    jest.clearAllMocks();
    PurchaseOrder.findAll
      .mockResolvedValueOnce([row({ year: 2026, month: 5, totalAmount: '10', Count: 1 })])
      .mockResolvedValueOnce([{ id: 10 }]);
    InvoiceModel.findAll.mockResolvedValueOnce([]);
    const cumulativeRes = mockRes();
    await analytics.getCummulativeGraphData(
      { query: { granularity: 'monthly', cluster: 'A' } },
      cumulativeRes
    );
    expect(PurchaseOrder.findAll).toHaveBeenNthCalledWith(2, { where: { cluster: 'A' } });
    expect(cumulativeRes.status).toHaveBeenCalledWith(200);

    jest.clearAllMocks();
    InvoiceModel.findAll.mockResolvedValueOnce([
      { month: 1, year: 2027 },
      { month: 12, year: 2026 },
    ]);
    PurchaseOrder.findAll.mockResolvedValueOnce([row({ id: 11 })]);
    const excelRes = mockRes();
    await analytics.getPoExcelData({}, excelRes);
    expect(PurchaseOrder.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.arrayContaining(['*']),
      })
    );
    expect(excelRes.status).toHaveBeenCalledWith(200);
  });
});
