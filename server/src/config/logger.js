const { createLogger, format, transports } = require('winston');
const env = require('./env');

// Custom log format for readability
const logFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
});

const logger = createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    logFormat
  ),
  transports: [
    new transports.Console({
      handleExceptions: true,
      format: format.combine(format.colorize(), logFormat),
    }),
  ],
});

module.exports = logger;
