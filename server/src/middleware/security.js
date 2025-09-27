const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');

/**
 * Aggregates common security middlewares so they can be applied together.
 */
const securityMiddleware = [
  helmet(),
  xss(),
  mongoSanitize(),
  hpp(),
  compression(),
];

module.exports = securityMiddleware;
