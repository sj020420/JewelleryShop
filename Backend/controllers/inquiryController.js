const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// POST /api/inquiries  (public - from Contact form / Buy Now)
async function createInquiry(req, res, next) {
  try {
    const { customerName, mobileNumber, productId, message } = req.body;
    if (!customerName || !mobileNumber) {
      throw new ApiError(400, 'customerName and mobileNumber are required.');
    }

    const [result] = await pool.query(
      `INSERT INTO InquiryHistory (CustomerName, MobileNumber, ProductId, Message)
       VALUES (?, ?, ?, ?)`,
      [customerName, mobileNumber, productId || null, message || null]
    );

    const [rows] = await pool.query('SELECT * FROM InquiryHistory WHERE InquiryId = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/inquiries  (admin) - supports ?status= & pagination
async function getInquiries(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let where = '';
    const params = [];
    if (status) {
      where = 'WHERE i.Status = ?';
      params.push(status);
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const [rows] = await pool.query(
      `SELECT i.*, p.NameEn AS ProductName, p.JewelleryNumber
       FROM InquiryHistory i
       LEFT JOIN Products p ON i.ProductId = p.ProductId
       ${where}
       ORDER BY i.CreatedAt DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// PUT /api/inquiries/:id/status  (admin)  { status }
async function updateInquiryStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['Pending', 'Contacted', 'Closed'].includes(status)) {
      throw new ApiError(400, 'status must be Pending, Contacted or Closed.');
    }

    const [result] = await pool.query(
      'UPDATE InquiryHistory SET Status=?, UpdatedAt=NOW() WHERE InquiryId=?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) throw new ApiError(404, 'Inquiry not found.');

    const [rows] = await pool.query('SELECT * FROM InquiryHistory WHERE InquiryId = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { createInquiry, getInquiries, updateInquiryStatus };
