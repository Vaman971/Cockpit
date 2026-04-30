const User = require('./userModel');
const UserProfile = require('./profileModel');
const Opportunity = require('./opportunityModel');
const Project = require('./projectModel');
const MissionCard = require('./missionModel');
const PurchaseOrder = require('./poModel');
const InvoiceModel = require('./invoiceModel');
const Team = require('./TeamModel');
const UserTeams = require('./UserTeams');
const Expense = require('./expenseModel');
const ForecastModel = require('./forecastModel');
const RevenueModel = require('./revenueModel');
const RevenueInvoiceModel = require('./revenueInvoiceModel');
const savingModel = require('./savingModel');
const ExtentionModel = require('./extentionModel');
const ExtentionInvoice = require('./extentionInvoice');
const CurrencyModel = require('./currencyModel');
const CustomerModel = require('./customerModel');
const SharePoint = require('./sharePointModel');
const MissionCardCustomer = require('./missionCardCustomerModel');
const logger = require('../utils/logger');

/**
 * Synchronizes all Sequelize models with the database.
 *
 * ⚠️  This uses `alter: true` for development convenience.
 *     In production, use proper migrations via Sequelize CLI:
 *     `npm run db:migrate`
 *
 * Controlled by the INIT_DB environment variable.
 * Set INIT_DB=true in your .env when you need to create/alter tables.
 * Revert to INIT_DB=false after first run.
 *
 * NOTE: This function no longer mutates the .env file.
 * You must manually set INIT_DB=false after initial setup.
 */
const sync = async () => {
  if (process.env.INIT_DB !== 'true') {
    logger.info('INIT_DB is not set to true — skipping table sync. Using existing schema.');
    return;
  }

  logger.warn(
    'INIT_DB=true: Synchronizing database tables with alter:true. This may modify existing columns.'
  );

  try {
    await User.sync({ alter: true });
    logger.info('Users table synced.');

    await UserProfile.sync({ alter: true });
    logger.info('UserProfile table synced.');

    await Opportunity.sync({ alter: true });
    logger.info('Opportunities table synced.');

    await Project.sync({ alter: true });
    logger.info('Projects table synced.');

    await MissionCard.sync({ alter: true });
    logger.info('MissionCard table synced.');

    await PurchaseOrder.sync({ alter: true });
    logger.info('PurchaseOrder table synced.');

    await InvoiceModel.sync({ alter: true });
    logger.info('Invoice table synced.');

    await Team.sync({ alter: true });
    logger.info('Team table synced.');

    await UserTeams.sync({ alter: true });
    logger.info('UserTeams table synced.');

    await ExtentionModel.sync({ alter: true });
    logger.info('Extension table synced.');

    await ExtentionInvoice.sync({ alter: true });
    logger.info('Extension Invoice table synced.');

    await Expense.sync({ alter: true });
    logger.info('Expense table synced.');

    await ForecastModel.sync({ alter: true });
    logger.info('ForecastModel table synced.');

    await RevenueModel.sync({ alter: true });
    logger.info('RevenueModel table synced.');

    await RevenueInvoiceModel.sync({ alter: true });
    logger.info('RevenueInvoiceModel table synced.');

    await savingModel.sync({ alter: true });
    logger.info('Savings table synced.');

    await CurrencyModel.sync({ alter: true });
    logger.info('Currency table synced.');

    await CustomerModel.sync({ alter: true });
    logger.info('Customer table synced.');

    await SharePoint.sync({ alter: true });
    logger.info('SharePoint table synced.');

    await MissionCardCustomer.sync({ alter: true });
    logger.info('MissionCardCustomer table synced.');

    logger.info('✅ All tables synchronized successfully.');
    logger.warn(
      'Remember to set INIT_DB=false in your .env file to prevent re-syncing on next startup.'
    );
  } catch (error) {
    logger.error('Database sync failed:', error);
    throw error; // Let the caller handle it
  }
};

module.exports = { sync };
