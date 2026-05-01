const mockDefine = jest.fn();

jest.mock('../db/connection', () => ({
  define: mockDefine,
}));

describe('forecastModel hooks', () => {
  let modelConfig;

  beforeEach(() => {
    jest.resetModules();
    mockDefine.mockClear();

    mockDefine.mockImplementation((modelName, attributes, options) => {
      modelConfig = { modelName, attributes, options };
      return {
        getTableName: () => modelName,
        rawAttributes: attributes,
        options,
      };
    });
  });

  it('sets updatedAt before create when revenueForcast is provided', () => {
    require('../models/forecastModel');

    const forecast = { revenueForcast: 100, updatedAt: null };

    modelConfig.options.hooks.beforeCreate(forecast);

    expect(forecast.updatedAt).toBeInstanceOf(Date);
  });

  it('does not set updatedAt before create when revenueForcast is undefined', () => {
    require('../models/forecastModel');

    const forecast = { revenueForcast: undefined, updatedAt: null };

    modelConfig.options.hooks.beforeCreate(forecast);

    expect(forecast.updatedAt).toBeNull();
  });

  it('sets updatedAt before update when revenueForcast changed', () => {
    require('../models/forecastModel');

    const forecast = {
      updatedAt: null,
      changed: jest.fn((field) => field === 'revenueForcast'),
    };

    modelConfig.options.hooks.beforeUpdate(forecast);

    expect(forecast.updatedAt).toBeInstanceOf(Date);
  });

  it('does not set updatedAt before update when revenueForcast did not change', () => {
    require('../models/forecastModel');

    const forecast = {
      updatedAt: null,
      changed: jest.fn(() => false),
    };

    modelConfig.options.hooks.beforeUpdate(forecast);

    expect(forecast.updatedAt).toBeNull();
  });
});
