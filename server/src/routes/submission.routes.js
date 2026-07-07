const express = require('express');

const submissionController = require('../controllers/submission.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const {
  validateStartSubmission,
  validateSubmitAnswers
} = require('../validators/submission.validator');

const router = express.Router();

router.post(
  '/start',
  requireAuth,
  requireRole('student'),
  validateStartSubmission,
  submissionController.startSubmission
);

router.get(
  '/my',
  requireAuth,
  requireRole('student'),
  submissionController.getMySubmissions
);

router.get(
  '/exam/:examId',
  requireAuth,
  requireRole('teacher', 'admin'),
  submissionController.getExamSubmissions
);

router.post(
  '/:submissionId/submit',
  requireAuth,
  requireRole('student'),
  validateSubmitAnswers,
  submissionController.submitAnswers
);

router.get(
  '/:submissionId',
  requireAuth,
  submissionController.getSubmissionById
);

module.exports = router;
