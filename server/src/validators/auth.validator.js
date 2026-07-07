const allowedRegisterRoles = ['student', 'teacher'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const validateEmail = (email) => {
  return typeof email === 'string' && emailPattern.test(email.trim());
};

const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(createError('Email is required'));
  }

  if (!validateEmail(email)) {
    return next(createError('Email must be a valid email address'));
  }

  if (!password) {
    return next(createError('Password is required'));
  }

  if (!validatePassword(password)) {
    return next(createError('Password must be at least 6 characters long'));
  }

  req.body.email = normalizeEmail(email);
  return next();
};

const validateRegister = (req, res, next) => {
  const { fullName, email, password } = req.body;
  const role = req.body.role || 'student';

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return next(createError('Full name is required'));
  }

  if (!email) {
    return next(createError('Email is required'));
  }

  if (!validateEmail(email)) {
    return next(createError('Email must be a valid email address'));
  }

  if (!password) {
    return next(createError('Password is required'));
  }

  if (!validatePassword(password)) {
    return next(createError('Password must be at least 6 characters long'));
  }

  if (!allowedRegisterRoles.includes(role)) {
    return next(createError('Role must be student or teacher'));
  }

  req.body.fullName = fullName.trim();
  req.body.email = normalizeEmail(email);
  req.body.role = role;

  return next();
};

module.exports = {
  validateLogin,
  validateRegister
};
