const examModel = require('../models/exam.model');
const questionModel = require('../models/question.model');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isTeacherOwner = (user, exam) => {
  return user.role === 'teacher' && String(user.id) === String(exam.teacherId);
};

const isPublishedAndAvailable = (exam) => {
  const now = new Date();
  const availableFrom = exam.availableFrom ? new Date(exam.availableFrom) : null;
  const availableUntil = exam.availableUntil ? new Date(exam.availableUntil) : null;

  return exam.status === 'published'
    && (!availableFrom || availableFrom <= now)
    && (!availableUntil || availableUntil >= now);
};

const canReadExam = (user, exam) => {
  if (user.role === 'admin') {
    return true;
  }

  if (isTeacherOwner(user, exam)) {
    return true;
  }

  return user.role === 'student' && isPublishedAndAvailable(exam);
};

const canManageExam = (user, exam) => {
  return user.role === 'admin' || isTeacherOwner(user, exam);
};

const getExamOrFail = async (examId) => {
  const exam = await examModel.findExamById(examId);

  if (!exam) {
    throw createError('Exam not found', 404);
  }

  return exam;
};

const listExams = async (user) => {
  return examModel.findExamsForUser(user);
};

const getExamById = async (user, examId) => {
  const exam = await getExamOrFail(examId);

  if (!canReadExam(user, exam)) {
    throw createError('You do not have permission to access this exam', 403);
  }

  return exam;
};

const createExam = async (user, examData) => {
  const teacherId = user.role === 'admin' && examData.teacherId
    ? examData.teacherId
    : user.id;

  const exam = await examModel.createExam({
    teacherId,
    title: examData.title,
    description: examData.description || null,
    durationMinutes: examData.durationMinutes || 60,
    availableFrom: examData.availableFrom || null,
    availableUntil: examData.availableUntil || null
  });

  await examModel.insertAuditLog({
    userId: user.id,
    action: 'exam_created',
    entityType: 'exam',
    entityId: exam.id,
    details: {
      title: exam.title,
      teacher_id: exam.teacherId,
      status: exam.status
    }
  });

  return exam;
};

const updateExam = async (user, examId, updates) => {
  const exam = await getExamOrFail(examId);

  if (!canManageExam(user, exam)) {
    throw createError('You do not have permission to update this exam', 403);
  }

  return examModel.updateExam(examId, updates);
};

const updateExamStatus = async (user, examId, status) => {
  const exam = await getExamOrFail(examId);

  if (!canManageExam(user, exam)) {
    throw createError('You do not have permission to update this exam status', 403);
  }

  const updatedExam = await examModel.updateExamStatus(examId, status);

  await examModel.insertAuditLog({
    userId: user.id,
    action: 'exam_status_changed',
    entityType: 'exam',
    entityId: exam.id,
    details: {
      title: exam.title,
      status_before: exam.status,
      status_after: updatedExam.status
    }
  });

  return updatedExam;
};

const getQuestionTypes = async () => {
  return questionModel.findQuestionTypes();
};

const getExamQuestions = async (user, examId) => {
  await getExamById(user, examId);
  const questions = await questionModel.findQuestionsByExamId(examId);

  if (user.role !== 'student') {
    return questions;
  }

  return questions.map((question) => ({
    ...question,
    options: question.options.map((option) => ({
      id: option.id,
      optionText: option.optionText,
      position: option.position
    }))
  }));
};

const addQuestion = async (user, examId, questionData) => {
  const exam = await getExamOrFail(examId);

  if (!canManageExam(user, exam)) {
    throw createError('You do not have permission to add questions to this exam', 403);
  }

  return questionModel.createQuestionWithOptions({
    examId,
    questionTypeId: questionData.questionTypeId,
    questionText: questionData.questionText,
    points: questionData.points,
    position: questionData.position,
    metadata: questionData.metadata || {},
    options: questionData.options || []
  });
};

module.exports = {
  listExams,
  getExamById,
  createExam,
  updateExam,
  updateExamStatus,
  getQuestionTypes,
  getExamQuestions,
  addQuestion
};
