const mockDefinedModels = [];
const mockSequelize = {
  define: jest.fn((name, rawAttributes, options) => {
    const model = {
      name,
      rawAttributes,
      options,
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
      getTableName: jest.fn(() => name),
    };
    mockDefinedModels.push(model);
    return model;
  }),
};

jest.mock('../db/connection', () => mockSequelize);

jest.mock('../models/projectModel', () => ({
  hasOne: jest.fn(),
}));

jest.mock('../models/userModel', () => ({
  hasOne: jest.fn(),
}));

const Project = require('../models/projectModel');
const User = require('../models/userModel');
const ExtensionModel = require('../models/extensionModel');
const ExtensionInvoice = require('../models/extensionInvoice');
const ExtentionModel = require('../models/extentionModel');
const ExtentionInvoice = require('../models/extentionInvoice');

const defineCalls = [...mockSequelize.define.mock.calls];
const definedModelNames = mockDefinedModels.map((model) => model.name);
const extensionBelongsToCalls = [...ExtensionModel.belongsTo.mock.calls];
const extensionHasManyCalls = [...ExtensionModel.hasMany.mock.calls];
const extensionInvoiceBelongsToCalls = [...ExtensionInvoice.belongsTo.mock.calls];
const extentionBelongsToCalls = [...ExtentionModel.belongsTo.mock.calls];
const extentionHasManyCalls = [...ExtentionModel.hasMany.mock.calls];
const extentionInvoiceBelongsToCalls = [...ExtentionInvoice.belongsTo.mock.calls];
const projectHasOneCalls = [...Project.hasOne.mock.calls];
const userHasOneCalls = [...User.hasOne.mock.calls];

describe('extension and extention Sequelize models', () => {
  it('maps renamed extension attributes onto the legacy database columns', () => {
    expect(ExtensionModel.name).toBe('extention');
    expect(ExtensionModel.options).toEqual({ timestamps: false });
    expect(ExtensionModel.rawAttributes.revenueProjection.field).toBe('revenue_projection');
    expect(ExtensionModel.rawAttributes.projectLeader.field).toBe('project_leader');
    expect(ExtensionModel.rawAttributes.currencyCode.field).toBe('currency_code');
    expect(ExtensionModel.rawAttributes.actualRevenue.field).toBe('actual_revenue');
    expect(ExtensionModel.rawAttributes.extensionStartDate.field).toBe('extention_start_date');
    expect(ExtensionModel.rawAttributes.extensionEndDate.field).toBe('extention_end_date');
    expect(ExtensionModel.rawAttributes.extensionProjectId.field).toBe('extention_project_id');
    expect(ExtensionModel.rawAttributes.createdAt.field).toBe('created_at');
  });

  it('registers associations for the renamed extension model and invoices', () => {
    expect(extensionBelongsToCalls).toContainEqual([
      Project,
      {
        foreignKey: 'extensionProjectId',
        as: 'projectExtension',
      },
    ]);
    expect(extensionBelongsToCalls).toContainEqual([
      User,
      {
        foreignKey: 'projectLeader',
        as: 'assignedExtensionLeader',
      },
    ]);
    expect(projectHasOneCalls).toContainEqual([
      ExtensionModel,
      {
        foreignKey: 'extensionProjectId',
        as: 'projectExtension',
      },
    ]);

    expect(ExtensionInvoice.name).toBe('extentioninvoice');
    expect(ExtensionInvoice.rawAttributes.invoiceDate.field).toBe('invoice_date');
    expect(ExtensionInvoice.rawAttributes.revenueProjection.field).toBe('revenue_projection');
    expect(ExtensionInvoice.rawAttributes.actualRevenue.field).toBe('actual_revenue');
    expect(ExtensionInvoice.rawAttributes.currencyCode.field).toBe('currency_code');
    expect(ExtensionInvoice.rawAttributes.extensionId.field).toBe('extention_id');
    expect(extensionInvoiceBelongsToCalls).toContainEqual([
      ExtensionModel,
      {
        foreignKey: 'extensionId',
        as: 'invoiceExtension',
      },
    ]);
    expect(extensionHasManyCalls).toContainEqual([
      ExtensionInvoice,
      {
        foreignKey: 'extensionId',
        as: 'extensionInvoices',
      },
    ]);
  });

  it('keeps legacy extention model attributes and associations intact', () => {
    expect(ExtentionModel.name).toBe('extention');
    expect(ExtentionModel.options).toEqual({ timestamps: false });
    expect(ExtentionModel.rawAttributes.revenueProjection.field).toBe('revenue_projection');
    expect(ExtentionModel.rawAttributes.projectLeader.field).toBe('project_leader');
    expect(ExtentionModel.rawAttributes.currencyCode.field).toBe('currency_code');
    expect(ExtentionModel.rawAttributes.actualRevenue.field).toBe('actual_revenue');
    expect(ExtentionModel.rawAttributes.extentionStartDate.field).toBe('extention_start_date');
    expect(ExtentionModel.rawAttributes.extentionEndDate.field).toBe('extention_end_date');
    expect(ExtentionModel.rawAttributes.extentionProjectId.field).toBe('extention_project_id');
    expect(ExtentionModel.rawAttributes.createdAt.field).toBe('created_at');

    expect(extentionBelongsToCalls).toContainEqual([
      Project,
      {
        foreignKey: 'extentionProjectId',
        as: 'projectExtention',
      },
    ]);
    expect(extentionBelongsToCalls).toContainEqual([
      User,
      {
        foreignKey: 'projectLeader',
        as: 'assignedProjectLeader',
      },
    ]);
    expect(projectHasOneCalls).toContainEqual([
      ExtentionModel,
      {
        foreignKey: 'extentionProjectId',
        as: 'projectExtention',
      },
    ]);
    expect(userHasOneCalls).toContainEqual([
      ExtentionModel,
      {
        foreignKey: 'projectLeader',
        as: 'assignedProjectLeader',
      },
    ]);
  });

  it('keeps legacy extention invoice mappings and associations intact', () => {
    expect(ExtentionInvoice.name).toBe('extentioninvoice');
    expect(ExtentionInvoice.options).toEqual({ timestamps: false });
    expect(ExtentionInvoice.rawAttributes.invoiceDate.field).toBe('invoice_date');
    expect(ExtentionInvoice.rawAttributes.revenueProjection.field).toBe('revenue_projection');
    expect(ExtentionInvoice.rawAttributes.actualRevenue.field).toBe('actual_revenue');
    expect(ExtentionInvoice.rawAttributes.currencyCode.field).toBe('currency_code');
    expect(ExtentionInvoice.rawAttributes.extentionId.field).toBe('extention_id');
    expect(extentionInvoiceBelongsToCalls).toContainEqual([
      ExtentionModel,
      {
        foreignKey: 'extentionId',
        as: 'invoiceExtention',
      },
    ]);
    expect(extentionHasManyCalls).toContainEqual([
      ExtentionInvoice,
      {
        foreignKey: 'extentionId',
        as: 'invoiceExtention',
      },
    ]);
  });

  it('defines exactly the four models covered by this suite', () => {
    expect(defineCalls).toHaveLength(4);
    expect(definedModelNames).toEqual([
      'extention',
      'extentioninvoice',
      'extention',
      'extentioninvoice',
    ]);
  });
});
