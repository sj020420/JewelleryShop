const slugify = require('slugify');
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/products
// Supports: page, limit, search, category, minPrice, maxPrice, purity,
// availability, featured, bestSelling, sortBy
async function getProducts(req, res, next) {
  try {
    const {
      page = 1, limit = 12, search, category, minPrice, maxPrice,
      purity, availability, featured, bestSelling, sortBy = 'newest',
    } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(p.NameEn LIKE ? OR p.NameMr LIKE ? OR p.JewelleryNumber LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) { conditions.push('c.Slug = ?'); params.push(category); }
    if (minPrice) { conditions.push('p.Price >= ?'); params.push(minPrice); }
    if (maxPrice) { conditions.push('p.Price <= ?'); params.push(maxPrice); }
    if (purity) { conditions.push('p.Purity = ?'); params.push(purity); }
    if (availability === 'in-stock') conditions.push('p.Quantity > 0');
    if (availability === 'out-of-stock') conditions.push('p.Quantity = 0');
    if (featured === 'true') conditions.push('p.IsFeatured = 1');
    if (bestSelling === 'true') conditions.push('p.IsBestSelling = 1');

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap = {
      newest: 'p.CreatedAt DESC',
      priceLowHigh: 'p.Price ASC',
      priceHighLow: 'p.Price DESC',
      nameAZ: 'p.NameEn ASC',
    };
    const orderBy = sortMap[sortBy] || sortMap.newest;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const dataQuery = `
      SELECT p.*, c.NameEn AS CategoryName, c.Slug AS CategorySlug,
        (SELECT ImageUrl FROM ProductImages pi WHERE pi.ProductId = p.ProductId
          ORDER BY pi.IsPrimary DESC, pi.DisplayOrder ASC LIMIT 1) AS PrimaryImage
      FROM Products p
      INNER JOIN Categories c ON p.CategoryId = c.CategoryId
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Products p
      INNER JOIN Categories c ON p.CategoryId = c.CategoryId
      ${whereClause}`;

    const [dataRows] = await pool.query(dataQuery, [...params, pageSize, offset]);
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    res.json({
      success: true,
      data: dataRows,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:slug
async function getProductBySlug(req, res, next) {
  try {
    const [productRows] = await pool.query(
      `SELECT p.*, c.NameEn AS CategoryName, c.Slug AS CategorySlug
       FROM Products p INNER JOIN Categories c ON p.CategoryId = c.CategoryId
       WHERE p.Slug = ?`,
      [req.params.slug]
    );

    const product = productRows[0];
    if (!product) throw new ApiError(404, 'Product not found.');

    const [images] = await pool.query(
      'SELECT * FROM ProductImages WHERE ProductId = ? ORDER BY IsPrimary DESC, DisplayOrder ASC',
      [product.ProductId]
    );

    const [similar] = await pool.query(
      `SELECT p.*,
        (SELECT ImageUrl FROM ProductImages pi WHERE pi.ProductId = p.ProductId
          ORDER BY pi.IsPrimary DESC LIMIT 1) AS PrimaryImage
       FROM Products p
       WHERE p.CategoryId = ? AND p.ProductId != ?
       ORDER BY p.CreatedAt DESC LIMIT 4`,
      [product.CategoryId, product.ProductId]
    );

    // increment view count (fire and forget)
    pool.query('UPDATE Products SET ViewCount = ViewCount + 1 WHERE ProductId = ?', [product.ProductId]).catch(() => {});

    res.json({ success: true, data: { ...product, images, similarProducts: similar } });
  } catch (err) {
    next(err);
  }
}

// POST /api/products  (admin) - multipart form with images[]
async function createProduct(req, res, next) {
  try {
    const {
      jewelleryNumber, nameEn, nameMr, categoryId, price, weight, purity,
      quantity, isFeatured, isBestSelling, descriptionEn, descriptionMr,
    } = req.body;

    if (!jewelleryNumber || !nameEn || !categoryId || !price || !weight || !purity) {
      throw new ApiError(400, 'jewelleryNumber, nameEn, categoryId, price, weight and purity are required.');
    }

    const slug = slugify(nameEn, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-5);

    const [result] = await pool.query(
      `INSERT INTO Products
        (JewelleryNumber, NameEn, NameMr, Slug, CategoryId, Price, Weight, Purity, Quantity, IsFeatured, IsBestSelling, DescriptionEn, DescriptionMr)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jewelleryNumber, nameEn, nameMr || null, slug, categoryId, price, weight, purity,
        quantity || 0,
        isFeatured === 'true' || isFeatured === true ? 1 : 0,
        isBestSelling === 'true' || isBestSelling === true ? 1 : 0,
        descriptionEn || null, descriptionMr || null,
      ]
    );

    const productId = result.insertId;

    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await pool.query(
          'INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, DisplayOrder) VALUES (?, ?, ?, ?)',
          [productId, `/uploads/products/${file.filename}`, i === 0 ? 1 : 0, i]
        );
      }
    }

    const [rows] = await pool.query('SELECT * FROM Products WHERE ProductId = ?', [productId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id  (admin)
async function updateProduct(req, res, next) {
  try {
    const [existingRows] = await pool.query('SELECT * FROM Products WHERE ProductId = ?', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) throw new ApiError(404, 'Product not found.');

    const b = req.body;
    const val = (key, fallback) => (b[key] !== undefined && b[key] !== '' ? b[key] : fallback);

    await pool.query(
      `UPDATE Products SET
        JewelleryNumber=?, NameEn=?, NameMr=?, CategoryId=?, Price=?, Weight=?, Purity=?, Quantity=?,
        IsFeatured=?, IsBestSelling=?, IsAvailable=?, DescriptionEn=?, DescriptionMr=?, UpdatedAt=NOW()
       WHERE ProductId=?`,
      [
        val('jewelleryNumber', existing.JewelleryNumber),
        val('nameEn', existing.NameEn),
        val('nameMr', existing.NameMr),
        val('categoryId', existing.CategoryId),
        val('price', existing.Price),
        val('weight', existing.Weight),
        val('purity', existing.Purity),
        val('quantity', existing.Quantity),
        b.isFeatured !== undefined ? (b.isFeatured === 'true' || b.isFeatured === true ? 1 : 0) : existing.IsFeatured,
        b.isBestSelling !== undefined ? (b.isBestSelling === 'true' || b.isBestSelling === true ? 1 : 0) : existing.IsBestSelling,
        b.isAvailable !== undefined ? (b.isAvailable === 'true' || b.isAvailable === true ? 1 : 0) : existing.IsAvailable,
        val('descriptionEn', existing.DescriptionEn),
        val('descriptionMr', existing.DescriptionMr),
        req.params.id,
      ]
    );

    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await pool.query(
          'INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, DisplayOrder) VALUES (?, ?, ?, ?)',
          [req.params.id, `/uploads/products/${file.filename}`, 0, i]
        );
      }
    }

    const [rows] = await pool.query('SELECT * FROM Products WHERE ProductId = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id  (admin)
async function deleteProduct(req, res, next) {
  try {
    const [images] = await pool.query('SELECT ImageUrl FROM ProductImages WHERE ProductId = ?', [req.params.id]);

    await pool.query('DELETE FROM Products WHERE ProductId = ?', [req.params.id]); // ProductImages cascade

    images.forEach((img) => {
      const filePath = path.join(__dirname, '..', img.ImageUrl.replace('/uploads', 'uploads'));
      fs.unlink(filePath, () => {});
    });

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/images/:imageId  (admin)
async function deleteProductImage(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM ProductImages WHERE ImageId = ?', [req.params.imageId]);
    if (!rows[0]) throw new ApiError(404, 'Image not found.');

    await pool.query('DELETE FROM ProductImages WHERE ImageId = ?', [req.params.imageId]);

    const filePath = path.join(__dirname, '..', rows[0].ImageUrl.replace('/uploads', 'uploads'));
    fs.unlink(filePath, () => {});

    res.json({ success: true, message: 'Image deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, deleteProductImage,
};
