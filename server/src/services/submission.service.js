const submissionModel = require('../models/submission.model');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isSubmissionOwner = (user, submission) => {
  return user.role === 'student' && String(user.id) === String(submission.studentId);
};

const isExamTeacher = (user, submission) => {
  return user.role === 'teacher'
    && String(user.id) === String(submission.exam.teacherId);
};

const canViewSubmission = (user, submission) => {
  return user.role === 'admin'
    || isSubmissionOwner(user, submission)
    || isExamTeacher(user, submission);
};

const startSubmission = async (user, examId) => {
  const exam = await submissionModel.findAvailableExamById(examId);

  if (!exam) {
    throw createError('Exam is not available for submission', 404);
  }

  const existingSubmission = await submissionModel.findInProgressSubmission(examId, user.id);

  if (existingSubmission) {
    return existingSubmission;
  }

  const submission = await submissionModel.createSubmission({
    examId,
    studentId: user.id
  });

  await submissionModel.insertAuditLog({
    userId: user.id,
    action: 'submission_started',
    entityType: 'submission',
    entityId: submission.id,
    details: {
      exam_id: submission.examId,
      exam_title: submission.exam.title,
      student_id: user.id,
      attempt_number: submission.attemptNumber
    }
  });

  return submission;
};

const submitAnswers = async (user, submissionId, answers) => {
  const submission = await submissionModel.findSubmissionById(submissionId);

  if (!submission) {
    throw createError('Submission not found', 404);
  }

  if (!isSubmissionOwner(user, submission)) {
    throw createError('You do not have permission to submit this exam', 403);
  }

  if (submission.status !== 'in_progress') {
    throw createError('Only in-progress submissions can be submitted', 400);
  }

  const submittedSubmission = await submissionModel.submitAnswers({
    submission,
    answers
  });

  await submissionModel.insertAuditLog({
    userId: user.id,
    action: 'submission_submitted',
    entityType: 'submission',
    entityId: submittedSubmission.id,
    details: {
      exam_id: submittedSubmission.examId,
      exam_title: submittedSubmission.exam.title,
      student_id: user.id,
      status_after: submittedSubmission.status
    }
  });

  return submittedSubmission;
};

const getMySubmissions = async (user) => {
  return submissionModel.findMySubmissions(user.id);
};

const getSubmissionById = async (user, submissionId) => {
  const submission = await submissionModel.findSubmissionDetail(submissionId);

  if (!submission) {
    throw createError('Submission not found', 404);
  }

  if (!canViewSubmission(user, submission)) {
    throw createError('You do not have permission to view this submission', 403);
  }

  if (user.role === 'student') {
    submission.feedback = submission.feedback.filter((item) => item.visibility === 'student');
  }

  return submission;
};

const getExamSubmissions = async (user, examId) => {
  const exam = await submissionModel.findExamById(examId);

  if (!exam) {
    throw createError('Exam not found', 404);
  }

  if (user.role === 'teacher' && String(user.id) !== String(exam.teacher_id)) {
    throw createError('You do not have permission to view submissions for this exam', 403);
  }

  return submissionModel.findSubmissionsByExamId(examId);
};

module.exports = {
  startSubmission,
  submitAnswers,
  getMySubmissions,
  getSubmissionById,
  getExamSubmissions
};
