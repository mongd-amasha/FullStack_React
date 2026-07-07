const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isScoreInRange = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 && numberValue <= 100;
};

const validateGradeSubmission = (req, res, next) => {
  const body = req.body;

  if (body.score === undefined || body.score === null || body.score === '') {
    return next(createError('Score is required'));
  }

  if (!isScoreInRange(body.score)) {
    return next(createError('Score must be between 0 and 100'));
  }

  if (body.feedback !== undefined && body.feedback !== null) {
    body.feedback = String(body.feedback).trim() || null;
  } else {
    body.feedback = null;
  }

  if (body.answerFeedback === undefined || body.answerFeedback === null) {
    body.answerFeedback = [];
  }

  if (!Array.isArray(body.answerFeedback)) {
    return next(createError('Answer feedback must be an array'));
  }

  try {
    const seenAnswerIds = new Set();

    body.answerFeedback = body.answerFeedback.map((item) => {
      if (!item || typeof item !== 'object') {
        throw createError('Each answer feedback item must be an object');
      }

      if (!item.answerId) {
        throw createError('Each answer feedback item must include answerId');
      }

      if (seenAnswerIds.has(item.answerId)) {
        throw createError('Each answer can only receive feedback once');
      }

      seenAnswerIds.add(item.answerId);

      if (item.pointsAwarded === undefined || item.pointsAwarded === null || item.pointsAwarded === '') {
        throw createError('Each answer feedback item must include pointsAwarded');
      }

      if (!isScoreInRange(item.pointsAwarded)) {
        throw createError('Answer points awarded must be between 0 and 100');
      }

      return {
        answerId: item.answerId,
        pointsAwarded: Number(item.pointsAwarded),
        feedback: item.feedback ? String(item.feedback).trim() : null
      };
    });

    body.score = Number(body.score);
    body.publish = body.publish === true;

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  validateGradeSubmission
};
