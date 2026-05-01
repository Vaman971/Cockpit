const request = require('supertest');

const okHandler = (name) =>
  jest.fn((req, res) =>
    res.status(200).json({
      handler: name,
      params: req.params,
      body: req.body,
    })
  );

const buildApp = (routePath, controllerPath, handlers) => {
  jest.resetModules();
  jest.doMock('../utils/verifyToken', () => jest.fn((req, res, next) => next()));
  jest.doMock('../utils/verifyAuth', () => jest.fn((req, res, next) => next()));
  jest.doMock(controllerPath, () => handlers);

  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use(require(routePath));
  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });
  return app;
};

const expectRoute = async ({
  routePath,
  controllerPath,
  handlers,
  method,
  url,
  body,
  handlerName,
}) => {
  const app = buildApp(routePath, controllerPath, handlers);
  let chain = request(app)[method](url);
  if (body) {
    chain = chain.send(body);
  }

  const response = await chain.expect(200);
  expect(response.body.handler).toBe(handlerName);
  expect(handlers[handlerName]).toHaveBeenCalledTimes(1);
  return response;
};

describe('CRUD Express route wiring', () => {
  afterEach(() => {
    jest.dontMock('../utils/verifyToken');
    jest.dontMock('../utils/verifyAuth');
    jest.resetModules();
  });

  it('wires customer CRUD endpoints through auth middleware', async () => {
    const handlers = {
      createCustomer: okHandler('createCustomer'),
      updatedCustomer: okHandler('updatedCustomer'),
      deleteCustomer: okHandler('deleteCustomer'),
      getCustomerByMissionId: okHandler('getCustomerByMissionId'),
      getMissionByCustomerId: okHandler('getMissionByCustomerId'),
      getCustomers: okHandler('getCustomers'),
    };

    await expectRoute({
      routePath: '../routes/customerRoute',
      controllerPath: '../controllers/customerController',
      handlers,
      method: 'post',
      url: '/createCustomer',
      body: { name: 'Acme' },
      handlerName: 'createCustomer',
    });
    await expectRoute({
      routePath: '../routes/customerRoute',
      controllerPath: '../controllers/customerController',
      handlers,
      method: 'put',
      url: '/updateCustomer/4',
      body: { name: 'Renamed' },
      handlerName: 'updatedCustomer',
    });
    await expectRoute({
      routePath: '../routes/customerRoute',
      controllerPath: '../controllers/customerController',
      handlers,
      method: 'delete',
      url: '/deleteCustomer/4',
      handlerName: 'deleteCustomer',
    });
  });

  it('wires expense and forecast CRUD routes', async () => {
    await expectRoute({
      routePath: '../routes/expenseRoute',
      controllerPath: '../controllers/expenseController',
      handlers: {
        createExpense: okHandler('createExpense'),
        getExpenses: okHandler('getExpenses'),
        getExpenseById: okHandler('getExpenseById'),
        updateExpenseById: okHandler('updateExpenseById'),
        getLatestExpense: okHandler('getLatestExpense'),
      },
      method: 'put',
      url: '/updateExpense/2',
      body: { expenseAmount: 75 },
      handlerName: 'updateExpenseById',
    });

    await expectRoute({
      routePath: '../routes/forecastRoute',
      controllerPath: '../controllers/forecastController',
      handlers: {
        createForecast: okHandler('createForecast'),
        getForecasts: okHandler('getForecasts'),
        getForecastById: okHandler('getForecastById'),
        updateForecast: okHandler('updateForecast'),
        getLatestForecasts: okHandler('getLatestForecasts'),
      },
      method: 'get',
      url: '/getForecast/3',
      handlerName: 'getForecastById',
    });
  });

  it('wires currency CRUD routes without a database', async () => {
    const handlers = {
      createCurrency: okHandler('createCurrency'),
      getCurrencyConversionRate: okHandler('getCurrencyConversionRate'),
      bulkCreateCurrencies: okHandler('bulkCreateCurrencies'),
      updateCurrency: okHandler('updateCurrency'),
      getCurrencies: okHandler('getCurrencies'),
      getCurrencyById: okHandler('getCurrencyById'),
      deleteCurrency: okHandler('deleteCurrency'),
      convertCurrency: okHandler('convertCurrency'),
    };

    await expectRoute({
      routePath: '../routes/currencyRoute',
      controllerPath: '../controllers/currencyController',
      handlers,
      method: 'post',
      url: '/create',
      body: { currency_code: 'EUR' },
      handlerName: 'createCurrency',
    });
    await expectRoute({
      routePath: '../routes/currencyRoute',
      controllerPath: '../controllers/currencyController',
      handlers,
      method: 'delete',
      url: '/delete/5',
      handlerName: 'deleteCurrency',
    });
  });

  it('runs invoice route validation before the controller', async () => {
    const handlers = {
      createInvoice: okHandler('createInvoice'),
      getInvoice: okHandler('getInvoice'),
      getInvoiceById: okHandler('getInvoiceById'),
      getInvoicesByPoId: okHandler('getInvoicesByPoId'),
      updateInvoiceById: okHandler('updateInvoiceById'),
      createInvoiceByPoId: okHandler('createInvoiceByPoId'),
      deleteInvoiceById: okHandler('deleteInvoiceById'),
    };
    const app = buildApp('../routes/invoiceRoute', '../controllers/invoiceController', handlers);

    await request(app)
      .post('/createInvoice')
      .send({ poId: 1, invoiceAmount: 100, forecastAmount: 120, invoiceDate: '2025-01-15' })
      .expect(200);
    expect(handlers.createInvoice).toHaveBeenCalledTimes(1);

    const invalid = await request(app)
      .post('/createInvoice')
      .send({ poId: 1, invoiceAmount: 100, forecastAmount: 120, invoiceDate: 'bad-date' })
      .expect(422);
    expect(invalid.body.success).toBe(false);
    expect(handlers.createInvoice).toHaveBeenCalledTimes(1);
  });

  it('wires revenue, revenue invoice, and savings CRUD endpoints', async () => {
    await expectRoute({
      routePath: '../routes/revenueRoute',
      controllerPath: '../controllers/revenueController',
      handlers: {
        createRevenue: okHandler('createRevenue'),
        getRevenues: okHandler('getRevenues'),
        getRevenueById: okHandler('getRevenueById'),
        updateRevenue: okHandler('updateRevenue'),
        getLatestRevenues: okHandler('getLatestRevenues'),
        getRevenueInvoices: okHandler('getRevenueInvoices'),
      },
      method: 'put',
      url: '/updateRevenue/7',
      body: { currencyCode: 'EUR' },
      handlerName: 'updateRevenue',
    });

    await expectRoute({
      routePath: '../routes/revenueInvoiceRoute',
      controllerPath: '../controllers/revenueInvoiceController',
      handlers: {
        createRevenueInvoice: okHandler('createRevenueInvoice'),
        getRevenueInvoices: okHandler('getRevenueInvoices'),
        getRevenueInvoiceById: okHandler('getRevenueInvoiceById'),
        getRevenueInvoicesByRevenueId: okHandler('getRevenueInvoicesByRevenueId'),
        updateRevenueInvoiceById: okHandler('updateRevenueInvoiceById'),
        deleteRevenueInvoiceById: okHandler('deleteRevenueInvoiceById'),
      },
      method: 'delete',
      url: '/deleteRevenueInvoice/8',
      handlerName: 'deleteRevenueInvoiceById',
    });

    await expectRoute({
      routePath: '../routes/savingRoute',
      controllerPath: '../controllers/savingsController',
      handlers: {
        createSaving: okHandler('createSaving'),
        updateSavingsById: okHandler('updateSavingsById'),
        getSavings: okHandler('getSavings'),
        getSavingsById: okHandler('getSavingsById'),
        getSavingsByRevenueId: okHandler('getSavingsByRevenueId'),
        deleteSavingById: okHandler('deleteSavingById'),
      },
      method: 'post',
      url: '/createSavings/9',
      body: { savingAmount: 50, savingDate: '2025-01-01' },
      handlerName: 'createSaving',
    });
  });

  it('wires extension and extension invoice route aliases for CRUD handlers', async () => {
    await expectRoute({
      routePath: '../routes/extensionRoute',
      controllerPath: '../controllers/extensionController',
      handlers: {
        createExtension: okHandler('createExtension'),
        updateExtension: okHandler('updateExtension'),
        getExtensions: okHandler('getExtensions'),
        getExtensionById: okHandler('getExtensionById'),
        getExtensionInvoices: okHandler('getExtensionInvoices'),
      },
      method: 'post',
      url: '/createExtension',
      body: { extensionProjectId: 1 },
      handlerName: 'createExtension',
    });

    await expectRoute({
      routePath: '../routes/extensionInvoiceRoute',
      controllerPath: '../controllers/extensionInvoiceController',
      handlers: {
        createExtensionInvoice: okHandler('createExtensionInvoice'),
        getExtensionInvoices: okHandler('getExtensionInvoices'),
        getExtensionInvoiceById: okHandler('getExtensionInvoiceById'),
        getExtensionInvoicesByExtensionId: okHandler('getExtensionInvoicesByExtensionId'),
        updateExtensionInvoiceById: okHandler('updateExtensionInvoiceById'),
        deleteExtensionInvoiceById: okHandler('deleteExtensionInvoiceById'),
      },
      method: 'put',
      url: '/updateExtensionInvoice/10',
      body: { actualRevenue: 12 },
      handlerName: 'updateExtensionInvoiceById',
    });
  });

  it('wires mission, sharepoint, user, and team routes', async () => {
    await expectRoute({
      routePath: '../routes/missionRoute',
      controllerPath: '../controllers/missionController',
      handlers: {
        createMission: okHandler('createMission'),
        updateMission: okHandler('updateMission'),
        getMissionById: okHandler('getMissionById'),
        getMission: okHandler('getMission'),
        getLatestMission: okHandler('getLatestMission'),
        getMissionsByProjectId: okHandler('getMissionsByProjectId'),
        assignCustomerToMission: okHandler('assignCustomerToMission'),
      },
      method: 'post',
      url: '/assignCustomerToMission/11',
      body: { customerIds: [1, 2] },
      handlerName: 'assignCustomerToMission',
    });

    await expectRoute({
      routePath: '../routes/sharePointRoute',
      controllerPath: '../controllers/sharePointController',
      handlers: {
        createSharepointLink: okHandler('createSharepointLink'),
        getSharepointLinkById: okHandler('getSharepointLinkById'),
        deleteSharepointLink: okHandler('deleteSharepointLink'),
        getSharepointLink: okHandler('getSharepointLink'),
        assignLinkToMission: okHandler('assignLinkToMission'),
        updateSharepointLink: okHandler('updateSharepointLink'),
      },
      method: 'put',
      url: '/updateSharepointLink/12',
      body: { url_link: 'https://example.test' },
      handlerName: 'updateSharepointLink',
    });

    await expectRoute({
      routePath: '../routes/userRoute',
      controllerPath: '../controllers/userController',
      handlers: {
        createUser: okHandler('createUser'),
        updateUser: okHandler('updateUser'),
        getUserById: okHandler('getUserById'),
        getUsers: okHandler('getUsers'),
        updatePassword: okHandler('updatePassword'),
        getUserDetails: okHandler('getUserDetails'),
        getMissionDetails: okHandler('getMissionDetails'),
      },
      method: 'put',
      url: '/updateUser/13',
      body: { username: 'New' },
      handlerName: 'updateUser',
    });

    await expectRoute({
      routePath: '../routes/teamRoute',
      controllerPath: '../controllers/teamController',
      handlers: {
        getAllTeams: okHandler('getAllTeams'),
        getTeamUsers: okHandler('getTeamUsers'),
        createTeam: okHandler('createTeam'),
        getTeamById: okHandler('getTeamById'),
        updateTeam: okHandler('updateTeam'),
        deleteTeamMembers: okHandler('deleteTeamMembers'),
        addUsersToTeam: okHandler('addUsersToTeam'),
        deleteUserFromTeam: okHandler('deleteUserFromTeam'),
        updateUserTeams: okHandler('updateUserTeams'),
      },
      method: 'put',
      url: '/updateUserTeams/2/1',
      body: { occupancy: 50 },
      handlerName: 'updateUserTeams',
    });
  });

  it('runs project, opportunity, and PO validation routes without touching models', async () => {
    const projectHandlers = {
      updateProject: okHandler('updateProject'),
      deleteProject: okHandler('deleteProject'),
      getProjectById: okHandler('getProjectById'),
      getProject: okHandler('getProject'),
      getProjectByOpportunityId: okHandler('getProjectByOpportunityId'),
      getProjectExcelData: okHandler('getProjectExcelData'),
    };
    const projectApp = buildApp(
      '../routes/projectRoute',
      '../controllers/projectController',
      projectHandlers
    );
    await request(projectApp).put('/update/1').send({}).expect(422);
    await request(projectApp).put('/update/1').send({ status: 'closed' }).expect(200);
    expect(projectHandlers.updateProject).toHaveBeenCalledTimes(1);

    const opportunityHandlers = {
      createOpportunity: okHandler('createOpportunity'),
      getOpportunityById: okHandler('getOpportunityById'),
      getOpportunity: okHandler('getOpportunity'),
      updateOpportunity: okHandler('updateOpportunity'),
      getLatestOpportunities: okHandler('getLatestOpportunities'),
    };
    const opportunityApp = buildApp(
      '../routes/opportunityRoute',
      '../controllers/opportunityController',
      opportunityHandlers
    );
    await request(opportunityApp).post('/createOpp').send({ OpDescription: '' }).expect(422);
    await request(opportunityApp)
      .post('/createOpp')
      .send({
        OpDescription: 'Deal',
        OpUnit: 'Consulting',
        AssociatedWP: 'WP-1',
        CustomerContactPoint: 'buyer@example.test',
        OpRegion: 'EU',
      })
      .expect(200);
    expect(opportunityHandlers.createOpportunity).toHaveBeenCalledTimes(1);

    const poHandlers = {
      createPo: okHandler('createPo'),
      getPo: okHandler('getPo'),
      getPoById: okHandler('getPoById'),
      updatePo: okHandler('updatePo'),
      getLatestPo: okHandler('getLatestPo'),
    };
    const poApp = buildApp('../routes/poRoute', '../controllers/poController', poHandlers);
    await request(poApp).post('/create').send({ poNumber: 'PO-1', poAmount: 1000 }).expect(200);
    await request(poApp).post('/create').send({ poNumber: 'PO-1', poAmount: 0 }).expect(422);
    expect(poHandlers.createPo).toHaveBeenCalledTimes(1);
  });
});
