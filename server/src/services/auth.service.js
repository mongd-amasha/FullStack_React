const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  findUserByEmail,
  createUser,
  toPublicUser
} = require('../models/user.model');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw createError('JWT_SECRET is not configured', 500);
  }

  return process.env.JWT_SECRET;
};

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );
};

const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('User account is inactive', 403);
  }

  let passwordMatches = false;

  try {
    passwordMatches = await bcrypt.compare(password, user.passwordHash);
  } catch (error) {
    passwordMatches = false;
  }

  if (!passwordMatches) {
    throw createError('Invalid email or password', 401);
  }

  return {
    user: toPublicUser(user),
    token: createToken(user)
  };
};

const register = async ({ fullName, email, password, role = 'student' }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw createError('Email is already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    fullName,
    email,
    passwordHash,
    role
  });

  return {
    user: toPublicUser(user),
    token: createToken(user)
  };
};

module.exports = {
  login,
  register,
  createToken
};
