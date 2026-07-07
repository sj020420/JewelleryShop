const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'JewelleryShop',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Fail fast on startup if MySQL is unreachable, rather than on the first request
async function testConnection() {
  const conn = await pool.getConnection();
  console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'JewelleryShop');
  conn.release();
}

module.exports = { pool, testConnection };
