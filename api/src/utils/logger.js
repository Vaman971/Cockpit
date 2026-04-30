const winston = require('winston');

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log format for development.
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return stack ? `[${ts}] ${level}: ${message}\n${stack}` : `[${ts}] ${level}: ${message}`;
  })
);

/**
 * JSON format for production — machine-readable for log aggregators.
 */
const prodFormat = combine(timestamp(), errors({ stack: true }), winston.format.json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

module.exports = logger;
