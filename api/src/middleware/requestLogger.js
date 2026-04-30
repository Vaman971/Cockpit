const morgan = require('morgan');
const logger = require('../utils/logger');

/**
 * HTTP request logger stream — pipes Morgan output through Winston.
 */
const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Skip logging in test environments to keep test output clean.
 */
const skipInTest = () => process.env.NODE_ENV === 'test';

/**
 * Combined format in production, dev-friendly format otherwise.
 */
const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

const requestLogger = morgan(format, {
  stream: morganStream,
  skip: skipInTest,
});

module.exports = requestLogger;
