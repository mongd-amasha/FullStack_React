const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
});

const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const PLACEHOLDER_HASH = '$2a$10$placeholderhash';
const SEED_PASSWORD = '123456';
const SEED_USER_EMAILS = [
  'admin@examapp.test',
  'dana.teacher@examapp.test',
  'eli.teacher@examapp.test',
  'alice.student@examapp.test',
  'ben.student@examapp.test',
  'cora.student@examapp.test',
  'noam.student@examapp.test'
];

const setSeedPasswords = async () => {
  try {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

    const result = await pool.query(
      `
        UPDATE exam_app.users
        SET password_hash = $1,
            updated_at = NOW()
        WHERE email = ANY($2::text[])
           OR password_hash = $3
        RETURNING id, email, role
      `,
      [passwordHash, SEED_USER_EMAILS, PLACEHOLDER_HASH]
    );

    console.log(`Updated ${result.rowCount} seed user password(s).`);
    console.log(`Seed login password is: ${SEED_PASSWORD}`);
  } catch (error) {
    console.error('Failed to update seed passwords:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

setSeedPasswords();
