const { Pool } = require('pg');
require('dotenv').config();

// Neon requires SSL. `rejectUnauthorized: false` is the standard setting
// for Neon's connection strings from Node's `pg` driver.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,                       // equivalent to mysql2's connectionLimit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  // Handles unexpected disconnects on idle clients so the process doesn't crash
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Fail fast on startup if Neon is unreachable, rather than on the first request
async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('✅ Connected to Neon PostgreSQL database');
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
