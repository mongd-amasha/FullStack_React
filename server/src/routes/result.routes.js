const express = require('express');

const resultController = require('../controllers/result.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { validateGradeSubmission } = require('../validators/result.validator');

const router = express.Router();

router.get(
  '/my',
  requireAuth,
  requireRole('student'),
  resultController.getMyResults
);

router.get(
  '/my/:resultId',
  requireAuth,
  requireRole('student'),
  resultController.getMyResultById
);

router.get(
  '/submission/:submissionId',
  requireAuth,
  requireRole('teacher', 'admin'),
  resultController.getSubmissionResultView
);

router.post(
  '/submission/:submissionId/grade',
  requireAuth,
  requireRole('teacher', 'admin'),
  validateGradeSubmission,
  resultController.gradeSubmission
);

router.get(
  '/exam/:examId',
  requireAuth,
  requireRole('teacher', 'admin'),
  resultController.getResultsByExam
);

router.patch(
  '/:resultId/publish',
  requireAuth,
  requireRole('teacher', 'admin'),
  resultController.publishResult
);

module.exports = router;
