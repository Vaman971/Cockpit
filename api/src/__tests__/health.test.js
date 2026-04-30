/**
 * Health & Server integration tests
 * Tests the Express app itself without mocking — just checks the top-level behaviour.
 */
const request = require('supertest');

// Mock the DB connection so the app can boot without a real database
jest.mock('../db/connection', () => ({
  authenticate: jest.fn().mockResolvedValue(true),
  define: jest.fn(() => ({
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sum: jest.fn(),
    afterCreate: jest.fn(),
    afterUpdate: jest.fn(),
    afterSave: jest.fn(),
    beforeCreate: jest.fn(),
    beforeUpdate: jest.fn(),
    beforeDestroy: jest.fn(),
    belongsTo: jest.fn(),
    hasOne: jest.fn(),
    hasMany: jest.fn(),
    belongsToMany: jest.fn(),
  })),
  query: jest.fn(),
  dialect: { name: 'mysql' },
  Sequelize: {},
}));

// Mock the sync module (calls the connection on startup)
jest.mock('../models/sync', () => ({ sync: jest.fn() }));

// Mock new extension models directly to prevent association setup at load time
jest.mock('../models/extensionModel', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  sum: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeCreate: jest.fn(),
  beforeUpdate: jest.fn(),
  beforeDestroy: jest.fn(),
  belongsTo: jest.fn(),
  hasOne: jest.fn(),
  hasMany: jest.fn(),
}));
jest.mock('../models/extensionInvoice', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  sum: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeCreate: jest.fn(),
  beforeUpdate: jest.fn(),
  beforeDestroy: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
}));

// Mock all models to prevent Sequelize from trying to connect during import
jest.mock('../models/userModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  beforeCreate: jest.fn(),
  beforeUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/profileModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/opportunityModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/projectModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/missionModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeCreate: jest.fn(),
  beforeUpdate: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/poModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/invoiceModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  sum: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/TeamModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/UserTeams', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  destroy: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/revenueModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/revenueInvoiceModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  sum: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/extentionModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/extentionInvoice', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  sum: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/savingModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  sum: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/customerModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/expenseModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/forecastModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/currencyModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/sharePointModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));
jest.mock('../models/missionCardCustomerModel', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeDestroy: jest.fn(),
}));

let app;
beforeAll(() => {
  app = require('../index');
});

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('GET /nonexistent-route', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
