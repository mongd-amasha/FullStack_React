const { testConnection } = require('../config/db');
const { successResponse } = require('../utils/apiResponse');

const getHealth = async (req, res, next) => {
  try {
    let databaseStatus = 'connected';

    try {
      await testConnection();
    } catch (error) {
      databaseStatus = 'not connected';
    }

    return successResponse(res, 'Server is running', {
      service: 'FullStack Exam Management API',
      database: databaseStatus
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHealth
};
