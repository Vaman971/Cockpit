const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// dotenv is already loaded by index.js — this file can rely on process.env
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectToDb = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

connectToDb();

module.exports = sequelize;
