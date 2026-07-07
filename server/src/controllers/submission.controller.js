const submissionService = require('../services/submission.service');
const { successResponse } = require('../utils/apiResponse');

const startSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.startSubmission(req.user, req.body.examId);
    return successResponse(res, 'Submission started successfully', { submission }, 201);
  } catch (error) {
    return next(error);
  }
};

const submitAnswers = async (req, res, next) => {
  try {
    const submission = await submissionService.submitAnswers(
      req.user,
      req.params.submissionId,
      req.body.answers
    );

    return successResponse(res, 'Submission submitted successfully', { submission });
  } catch (error) {
    return next(error);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await submissionService.getMySubmissions(req.user);
    return successResponse(res, 'Submissions loaded successfully', { submissions });
  } catch (error) {
    return next(error);
  }
};

const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await submissionService.getSubmissionById(req.user, req.params.submissionId);
    return successResponse(res, 'Submission loaded successfully', { submission });
  } catch (error) {
    return next(error);
  }
};

const getExamSubmissions = async (req, res, next) => {
  try {
    const submissions = await submissionService.getExamSubmissions(req.user, req.params.examId);
    return successResponse(res, 'Exam submissions loaded successfully', { submissions });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  startSubmission,
  submitAnswers,
  getMySubmissions,
  getSubmissionById,
  getExamSubmissions
};
