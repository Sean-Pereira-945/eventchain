/**
 * Helper to standardize API responses.
 */
const respond = (res, statusCode, payload = {}, meta = {}) => {
  const body = {
    success: statusCode >= 200 && statusCode < 300,
    ...payload,
  };

  if (Object.keys(meta).length) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
};

module.exports = respond;
