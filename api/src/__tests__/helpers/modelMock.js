/**
 * Shared mock factories for Sequelize models.
 * Each helper creates a full mock object with the methods controllers need.
 *
 * Usage in test files:
 *   jest.mock('../models/userModel', () => require('./mocks/modelMock').mockModel());
 */

/**
 * Creates a generic Sequelize-model mock.
 * Override individual methods per-test with jest.fn().mockResolvedValue(...)
 */
const mockModel = (overrides = {}) => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  sum: jest.fn(),
  count: jest.fn(),
  // Lifecycle hooks — controllers register these at module load; we no-op them in tests
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
  afterSave: jest.fn(),
  beforeCreate: jest.fn(),
  beforeUpdate: jest.fn(),
  beforeDestroy: jest.fn(),
  ...overrides,
});

/**
 * Creates a mock Sequelize instance (row object returned from findByPk / findOne).
 */
const mockRow = (data = {}) => ({
  ...data,
  dataValues: data,
  toJSON: jest.fn(() => ({ ...data })),
  update: jest.fn().mockResolvedValue([1]),
  save: jest.fn().mockResolvedValue({ ...data }),
  destroy: jest.fn().mockResolvedValue(1),
  changed: jest.fn(() => Object.keys(data)),
  get: jest.fn((key) => data[key]),
});

module.exports = { mockModel, mockRow };
