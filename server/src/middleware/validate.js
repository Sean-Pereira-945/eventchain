const AppError = require('../utils/AppError');

/**
 * Generic validation middleware wrapper around Joi schemas.
 */
const validate = (schema, property = 'body') => (req, res, next) => {
  if (!schema) return next();

  const { value, error } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return next(new AppError('Validation failed', 400, error.details.map((d) => d.message)));
  }

  req[property] = value;
  return next();
};

module.exports = validate;
