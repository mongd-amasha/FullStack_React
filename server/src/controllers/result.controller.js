const resultService = require('../services/result.service');
const { successResponse } = require('../utils/apiResponse');

const getSubmissionResultView = async (req, res, next) => {
  try {
    const resultView = await resultService.getSubmissionResultView(req.user, req.params.submissionId);
    return successResponse(res, 'Submission result view loaded successfully', resultView);
  } catch (error) {
    return next(error);
  }
};

const gradeSubmission = async (req, res, next) => {
  try {
    const resultView = await resultService.gradeSubmission(
      req.user,
      req.params.submissionId,
      req.body
    );

    return successResponse(res, 'Submission graded successfully', resultView);
  } catch (error) {
    return next(error);
  }
};

const publishResult = async (req, res, next) => {
  try {
    const resultView = await resultService.publishResult(req.user, req.params.resultId);
    return successResponse(res, 'Result published successfully', resultView);
  } catch (error) {
    return next(error);
  }
};

const getResultsByExam = async (req, res, next) => {
  try {
    const results = await resultService.getResultsByExam(req.user, req.params.examId);
    return successResponse(res, 'Exam results loaded successfully', { results });
  } catch (error) {
    return next(error);
  }
};

const getMyResults = async (req, res, next) => {
  try {
    const results = await resultService.getMyResults(req.user);
    return successResponse(res, 'My results loaded successfully', { results });
  } catch (error) {
    return next(error);
  }
};

const getMyResultById = async (req, res, next) => {
  try {
    const resultView = await resultService.getMyResultById(req.user, req.params.resultId);
    return successResponse(res, 'Result loaded successfully', resultView);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSubmissionResultView,
  gradeSubmission,
  publishResult,
  getResultsByExam,
  getMyResults,
  getMyResultById
};
