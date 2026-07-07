const resultModel = require('../models/result.model');
const submissionModel = require('../models/submission.model');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isExamTeacher = (user, exam) => {
  return user.role === 'teacher' && String(user.id) === String(exam.teacherId);
};

const canTeacherOrAdminAccessExam = (user, exam) => {
  return user.role === 'admin' || isExamTeacher(user, exam);
};

const getSubmissionResultView = async (user, submissionId) => {
  const view = await resultModel.findSubmissionResultView(submissionId);

  if (!view) {
    throw createError('Submission not found', 404);
  }

  if (!canTeacherOrAdminAccessExam(user, view.exam)) {
    throw createError('You do not have permission to view this result', 403);
  }

  return view;
};

const gradeSubmission = async (user, submissionId, gradeData) => {
  const view = await resultModel.findSubmissionResultView(submissionId);

  if (!view) {
    throw createError('Submission not found', 404);
  }

  if (!canTeacherOrAdminAccessExam(user, view.exam)) {
    throw createError('You do not have permission to grade this submission', 403);
  }

  if (view.submission.status === 'in_progress') {
    throw createError('Only submitted submissions can be graded', 400);
  }

  const resultId = await resultModel.gradeSubmission({
    submissionId,
    gradedBy: user.id,
    studentId: view.student.id,
    examId: view.exam.id,
    score: gradeData.score,
    feedback: gradeData.feedback,
    answerFeedback: gradeData.answerFeedback,
    publish: gradeData.publish
  });

  const resultView = await resultModel.findResultDetailById(resultId);

  await resultModel.insertAuditLog({
    userId: user.id,
    action: 'result_graded',
    entityType: 'grade',
    entityId: resultId,
    details: {
      submission_id: submissionId,
      exam_id: view.exam.id,
      exam_title: view.exam.title,
      student_id: view.student.id,
      score: gradeData.score,
      published: gradeData.publish
    }
  });

  return resultView;
};

const publishResult = async (user, resultId) => {
  const existingResult = await resultModel.findResultDetailById(resultId);

  if (!existingResult) {
    throw createError('Result not found', 404);
  }

  if (!canTeacherOrAdminAccessExam(user, existingResult.exam)) {
    throw createError('You do not have permission to publish this result', 403);
  }

  const publishedResultId = await resultModel.publishResult(resultId);

  if (!publishedResultId) {
    throw createError('Result not found', 404);
  }

  const resultView = await resultModel.findResultDetailById(resultId);

  await resultModel.insertAuditLog({
    userId: user.id,
    action: 'result_published',
    entityType: 'grade',
    entityId: resultId,
    details: {
      submission_id: existingResult.submission.id,
      exam_id: existingResult.exam.id,
      exam_title: existingResult.exam.title,
      student_id: existingResult.student.id,
      status_after: 'published'
    }
  });

  return resultView;
};

const getResultsByExam = async (user, examId) => {
  const exam = await submissionModel.findExamById(examId);

  if (!exam) {
    throw createError('Exam not found', 404);
  }

  const examForPermission = {
    id: exam.id,
    teacherId: exam.teacher_id
  };

  if (!canTeacherOrAdminAccessExam(user, examForPermission)) {
    throw createError('You do not have permission to view results for this exam', 403);
  }

  return resultModel.findResultsByExamId(examId);
};

const getMyResults = async (user) => {
  return resultModel.findPublishedResultsForStudent(user.id);
};

const getMyResultById = async (user, resultId) => {
  const resultView = await resultModel.findResultDetailById(resultId, true);

  if (!resultView || resultView.result.status !== 'published') {
    throw createError('Published result not found', 404);
  }

  if (String(resultView.student.id) !== String(user.id)) {
    throw createError('You do not have permission to view this result', 403);
  }

  return resultView;
};

module.exports = {
  getSubmissionResultView,
  gradeSubmission,
  publishResult,
  getResultsByExam,
  getMyResults,
  getMyResultById
};
