const express = require('express');

const examController = require('../controllers/exam.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const {
  validateCreateExam,
  validateUpdateExam,
  validateStatusUpdate,
  validateCreateQuestion
} = require('../validators/exam.validator');

const router = express.Router();

router.get('/question-types', requireAuth, examController.getQuestionTypes);

router.get('/', requireAuth, examController.listExams);
router.post(
  '/',
  requireAuth,
  requireRole('teacher', 'admin'),
  validateCreateExam,
  examController.createExam
);

router.get('/:examId', requireAuth, examController.getExamById);
router.put(
  '/:examId',
  requireAuth,
  requireRole('teacher', 'admin'),
  validateUpdateExam,
  examController.updateExam
);
router.patch(
  '/:examId/status',
  requireAuth,
  requireRole('teacher', 'admin'),
  validateStatusUpdate,
  examController.updateExamStatus
);

router.get('/:examId/questions', requireAuth, examController.getExamQuestions);
router.post(
  '/:examId/questions',
  requireAuth,
  requireRole('teacher', 'admin'),
  validateCreateQuestion,
  examController.addQuestion
);

module.exports = router;
