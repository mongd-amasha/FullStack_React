const { errorResponse } = require('../utils/apiResponse');

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  return errorResponse(res, message, statusCode);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
