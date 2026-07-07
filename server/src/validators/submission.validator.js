const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateStartSubmission = (req, res, next) => {
  if (!req.body.examId) {
    return next(createError('Exam id is required'));
  }

  return next();
};

const validateSubmitAnswers = (req, res, next) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return next(createError('Answers must be an array'));
  }

  try {
    const seenQuestionIds = new Set();

    req.body.answers = answers.map((answer) => {
      if (!answer || typeof answer !== 'object') {
        throw createError('Each answer must be an object');
      }

      if (!answer.questionId) {
        throw createError('Each answer must include questionId');
      }

      if (seenQuestionIds.has(answer.questionId)) {
        throw createError('Each question can only be answered once');
      }

      seenQuestionIds.add(answer.questionId);

      const selectedOptionId = answer.selectedOptionId || null;
      const answerText = typeof answer.answerText === 'string'
        ? answer.answerText.trim()
        : null;

      if (!selectedOptionId && !answerText) {
        throw createError('Each answer must include selectedOptionId or answerText');
      }

      return {
        questionId: answer.questionId,
        selectedOptionId,
        answerText: answerText || null
      };
    });

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  validateStartSubmission,
  validateSubmitAnswers
};
