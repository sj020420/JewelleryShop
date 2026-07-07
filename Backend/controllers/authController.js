const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const generateToken = require('../utils/generateToken');
const { ApiError } = require('../middleware/errorHandler');

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password are required.');

    const [rows] = await pool.query(
      'SELECT * FROM Admin WHERE Email = ? AND IsActive = 1',
      [email]
    );
    const admin = rows[0];
    if (!admin) throw new ApiError(401, 'Invalid email or password.');

    const isMatch = await bcrypt.compare(password, admin.PasswordHash);
    if (!isMatch) throw new ApiError(401, 'Invalid email or password.');

    const token = generateToken({ adminId: admin.AdminId, email: admin.Email, role: admin.Role });

    res.json({
      success: true,
      token,
      admin: {
        adminId: admin.AdminId,
        fullName: admin.FullName,
        email: admin.Email,
        role: admin.Role,
        profileImage: admin.ProfileImage,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/profile
async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT AdminId, FullName, Email, Role, ProfileImage, CreatedAt FROM Admin WHERE AdminId = ?',
      [req.admin.adminId]
    );
    if (!rows[0]) throw new ApiError(404, 'Admin not found.');
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { fullName, currentPassword, newPassword } = req.body;

    if (newPassword) {
      const [rows] = await pool.query('SELECT PasswordHash FROM Admin WHERE AdminId = ?', [req.admin.adminId]);
      const isMatch = await bcrypt.compare(currentPassword || '', rows[0].PasswordHash);
      if (!isMatch) throw new ApiError(400, 'Current password is incorrect.');

      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.query(
        'UPDATE Admin SET FullName = ?, PasswordHash = ?, UpdatedAt = NOW() WHERE AdminId = ?',
        [fullName, newHash, req.admin.adminId]
      );
    } else {
      await pool.query(
        'UPDATE Admin SET FullName = ?, UpdatedAt = NOW() WHERE AdminId = ?',
        [fullName, req.admin.adminId]
      );
    }

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, getProfile, updateProfile };
