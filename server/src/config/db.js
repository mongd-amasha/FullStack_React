const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'postgres'
    };

const pool = new Pool(poolConfig);

const testConnection = async () => {
  await pool.query('SELECT NOW()');
};

module.exports = {
  pool,
  testConnection
};
