const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seedAdmin(shouldClosePool = false) {
  try {
    const email = 'swapniljadhav@gmail.com';
    const name = 'Admin';
    const password = 'Swapnil@1001';
    const role = 'admin';

    // Check if an admin with this email already exists
    const checkQuery = 'SELECT * FROM "Admin" WHERE "Email" = $1';
    const { rows } = await pool.query(checkQuery, [email]);

    if (rows.length > 0) {
      console.log('Admin already exists');
      return;
    }

    // Hash the password using bcrypt with 10 salt rounds
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert the admin user
    const insertQuery = `
      INSERT INTO "Admin" ("FullName", "Email", "PasswordHash", "Role", "IsActive")
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(insertQuery, [name, email, passwordHash, role, true]);
    console.log('Default admin created successfully');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    if (shouldClosePool) {
      try {
        await pool.end();
      } catch (err) {
        console.error('Error closing database pool:', err);
      }
    }
  }
}

// If run directly (e.g. node utils/seedAdmin.js)
if (require.main === module) {
  // Load environment variables in case they aren't loaded yet
  require('dotenv').config();
  seedAdmin(true);
}

module.exports = { seedAdmin };
