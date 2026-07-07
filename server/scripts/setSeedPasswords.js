const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
});

const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const PLACEHOLDER_HASH = '$2a$10$placeholderhash';
const SEED_PASSWORD = '123456';

const setSeedPasswords = async () => {
  try {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

    const result = await pool.query(
      `
        UPDATE exam_app.users
        SET password_hash = $1,
            updated_at = NOW()
        WHERE password_hash = $2
        RETURNING id, email, role
      `,
      [passwordHash, PLACEHOLDER_HASH]
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
