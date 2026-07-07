const jwt = require('jsonwebtoken');

const { findUserById, toPublicUser } = require('../models/user.model');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw createError('JWT_SECRET is not configured', 500);
  }

  return process.env.JWT_SECRET;
};

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw createError('Authentication token is required', 401);
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await findUserById(decoded.id);

    if (!user || !user.isActive) {
      throw createError('Invalid or expired authentication token', 401);
    }

    req.user = toPublicUser(user);
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(createError('Invalid or expired authentication token', 401));
    }

    return next(error);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Authentication is required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('You do not have permission to access this resource', 403));
    }

    return next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};
