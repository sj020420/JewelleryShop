const slugify = require('slugify');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM Categories ORDER BY DisplayOrder ASC, NameEn ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/categories/:slug
async function getCategoryBySlug(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM Categories WHERE Slug = ?', [req.params.slug]);
    if (!rows[0]) throw new ApiError(404, 'Category not found.');
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// POST /api/categories  (admin)
async function createCategory(req, res, next) {
  try {
    const { nameEn, nameMr, description, displayOrder } = req.body;
    if (!nameEn) throw new ApiError(400, 'Category name (English) is required.');
    const slug = slugify(nameEn, { lower: true, strict: true });

    const [result] = await pool.query(
      `INSERT INTO Categories (NameEn, NameMr, Slug, Description, DisplayOrder)
       VALUES (?, ?, ?, ?, ?)`,
      [nameEn, nameMr || null, slug, description || null, displayOrder || 0]
    );

    const [rows] = await pool.query('SELECT * FROM Categories WHERE CategoryId = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/categories/:id  (admin)
async function updateCategory(req, res, next) {
  try {
    const { nameEn, nameMr, description, displayOrder, isActive } = req.body;

    const [existingRows] = await pool.query('SELECT * FROM Categories WHERE CategoryId = ?', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) throw new ApiError(404, 'Category not found.');

    const slug = nameEn ? slugify(nameEn, { lower: true, strict: true }) : existing.Slug;

    await pool.query(
      `UPDATE Categories SET NameEn=?, NameMr=?, Slug=?, Description=?, DisplayOrder=?, IsActive=?, UpdatedAt=NOW()
       WHERE CategoryId=?`,
      [
        nameEn ?? existing.NameEn,
        nameMr ?? existing.NameMr,
        slug,
        description ?? existing.Description,
        displayOrder ?? existing.DisplayOrder,
        isActive ?? existing.IsActive,
        req.params.id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM Categories WHERE CategoryId = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/categories/:id  (admin)
async function deleteCategory(req, res, next) {
  try {
    const [inUse] = await pool.query('SELECT COUNT(*) AS cnt FROM Products WHERE CategoryId = ?', [req.params.id]);
    if (inUse[0].cnt > 0) {
      throw new ApiError(400, 'Cannot delete category that still has products. Move or delete those products first.');
    }
    await pool.query('DELETE FROM Categories WHERE CategoryId = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };
