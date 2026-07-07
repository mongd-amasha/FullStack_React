const authService = require('../services/auth.service');
const { successResponse } = require('../utils/apiResponse');

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    return successResponse(res, 'Login completed successfully', data);
  } catch (error) {
    return next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    return successResponse(res, 'Registration completed successfully', data, 201);
  } catch (error) {
    return next(error);
  }
};

const getMe = (req, res) => {
  return successResponse(res, 'Current user loaded successfully', {
    user: req.user
  });
};

module.exports = {
  login,
  register,
  getMe
};
