const examService = require('../services/exam.service');
const { successResponse } = require('../utils/apiResponse');

const listExams = async (req, res, next) => {
  try {
    const exams = await examService.listExams(req.user);
    return successResponse(res, 'Exams loaded successfully', { exams });
  } catch (error) {
    return next(error);
  }
};

const getExamById = async (req, res, next) => {
  try {
    const exam = await examService.getExamById(req.user, req.params.examId);
    return successResponse(res, 'Exam loaded successfully', { exam });
  } catch (error) {
    return next(error);
  }
};

const createExam = async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.user, req.body);
    return successResponse(res, 'Exam created successfully', { exam }, 201);
  } catch (error) {
    return next(error);
  }
};

const updateExam = async (req, res, next) => {
  try {
    const exam = await examService.updateExam(req.user, req.params.examId, req.body);
    return successResponse(res, 'Exam updated successfully', { exam });
  } catch (error) {
    return next(error);
  }
};

const updateExamStatus = async (req, res, next) => {
  try {
    const exam = await examService.updateExamStatus(req.user, req.params.examId, req.body.status);
    return successResponse(res, 'Exam status updated successfully', { exam });
  } catch (error) {
    return next(error);
  }
};

const getQuestionTypes = async (req, res, next) => {
  try {
    const questionTypes = await examService.getQuestionTypes();
    return successResponse(res, 'Question types loaded successfully', { questionTypes });
  } catch (error) {
    return next(error);
  }
};

const getExamQuestions = async (req, res, next) => {
  try {
    const questions = await examService.getExamQuestions(req.user, req.params.examId);
    return successResponse(res, 'Exam questions loaded successfully', { questions });
  } catch (error) {
    return next(error);
  }
};

const addQuestion = async (req, res, next) => {
  try {
    const question = await examService.addQuestion(req.user, req.params.examId, req.body);
    return successResponse(res, 'Question added successfully', { question }, 201);
  } catch (error) {
    return next(error);
  }
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
