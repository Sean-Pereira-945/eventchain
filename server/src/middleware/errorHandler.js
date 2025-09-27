const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const env = require('../config/env');

/**
 * Convert Joi validation errors into our AppError format for consistency.
 */
const handleValidationError = (err) => {
  if (err.isJoi) {
    return new AppError('Validation failed', 400, err.details.map((d) => d.message));
  }
  return err;
};

/**
 * Express error handler that ensures consistent response format and logs the incident.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof AppError)) {
    error = handleValidationError(error);
  }

  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'Internal server error',
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (!error.isOperational && env.isProduction) {
    payload.message = 'Something went wrong';
    delete payload.details;
  }

  logger.error('API error', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    stack: error.stack,
  });

  res.status(statusCode).json(payload);
  next();
};

module.exports = errorHandler;
