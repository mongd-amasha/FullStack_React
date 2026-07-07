const { pool } = require('../config/db');

const mapUser = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const toPublicUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role
});

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
      SELECT id, full_name, email, password_hash, role, is_active, created_at, updated_at
      FROM exam_app.users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return mapUser(result.rows[0]);
};

const findUserById = async (id) => {
  const result = await pool.query(
    `
      SELECT id, full_name, email, password_hash, role, is_active, created_at, updated_at
      FROM exam_app.users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapUser(result.rows[0]);
};

const createUser = async ({ fullName, email, passwordHash, role }) => {
  const result = await pool.query(
    `
      INSERT INTO exam_app.users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, password_hash, role, is_active, created_at, updated_at
    `,
    [fullName, email, passwordHash, role]
  );

  return mapUser(result.rows[0]);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  toPublicUser
};
