const validStatuses = ['draft', 'published', 'closed', 'archived'];

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isPlainObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const isPositiveNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0;
};

const normalizeDateField = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError(`${fieldName} must be a valid date`);
  }

  return date.toISOString();
};

const normalizeExamPayload = (req, requireTitle) => {
  const body = req.body;

  if (requireTitle && (!body.title || typeof body.title !== 'string' || !body.title.trim())) {
    throw createError('Title is required');
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw createError('Title cannot be empty');
    }

    body.title = body.title.trim();
  }

  if (body.description !== undefined && body.description !== null) {
    body.description = String(body.description).trim() || null;
  }

  if (body.durationMinutes !== undefined) {
    if (!isPositiveNumber(body.durationMinutes)) {
      throw createError('Duration minutes must be a positive number');
    }

    body.durationMinutes = Number(body.durationMinutes);
  }

  if (body.availableFrom !== undefined) {
    body.availableFrom = normalizeDateField(body.availableFrom, 'Available from');
  }

  if (body.availableUntil !== undefined) {
    body.availableUntil = normalizeDateField(body.availableUntil, 'Available until');
  }

  if (body.availableFrom && body.availableUntil) {
    const availableFrom = new Date(body.availableFrom);
    const availableUntil = new Date(body.availableUntil);

    if (availableUntil <= availableFrom) {
      throw createError('Available until must be after available from');
    }
  }
};

const validateCreateExam = (req, res, next) => {
  try {
    normalizeExamPayload(req, true);

    if (req.body.durationMinutes === undefined) {
      req.body.durationMinutes = 60;
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

const validateUpdateExam = (req, res, next) => {
  try {
    normalizeExamPayload(req, false);
    return next();
  } catch (error) {
    return next(error);
  }
};

const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(createError('Status is required'));
  }

  if (!validStatuses.includes(status)) {
    return next(createError('Status must be draft, published, closed, or archived'));
  }

  return next();
};

const validateCreateQuestion = (req, res, next) => {
  try {
    const body = req.body;

    if (!body.questionTypeId) {
      return next(createError('Question type id is required'));
    }

    if (!body.questionText || typeof body.questionText !== 'string' || !body.questionText.trim()) {
      return next(createError('Question text is required'));
    }

    if (!isPositiveNumber(body.points)) {
      return next(createError('Points must be positive'));
    }

    if (!isPositiveNumber(body.position)) {
      return next(createError('Position must be positive'));
    }

    if (body.metadata === undefined || body.metadata === null) {
      body.metadata = {};
    }

    if (!isPlainObject(body.metadata)) {
      return next(createError('Metadata must be an object'));
    }

    if (body.options === undefined || body.options === null) {
      body.options = [];
    }

    if (!Array.isArray(body.options)) {
      return next(createError('Options must be an array'));
    }

    body.questionText = body.questionText.trim();
    body.points = Number(body.points);
    body.position = Number(body.position);
    body.options = body.options.map((option, index) => {
      if (!option || typeof option !== 'object') {
        throw createError('Each option must be an object');
      }

      if (!option.optionText || typeof option.optionText !== 'string' || !option.optionText.trim()) {
        throw createError('Each option must include optionText');
      }

      return {
        optionText: option.optionText.trim(),
        isCorrect: Boolean(option.isCorrect),
        position: option.position ? Number(option.position) : index + 1
      };
    });

    for (const option of body.options) {
      if (!isPositiveNumber(option.position)) {
        return next(createError('Option position must be positive'));
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  validateCreateExam,
  validateUpdateExam,
  validateStatusUpdate,
  validateCreateQuestion
};
