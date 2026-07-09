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
    let i = 0; // running placeholder index ($1, $2, ...)
    const next_ = () => `$${++i}`;

    if (search) {
      conditions.push(`(p."NameEn" ILIKE ${next_()} OR p."NameMr" ILIKE ${next_()} OR p."JewelleryNumber" ILIKE ${next_()})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) { conditions.push(`c."Slug" = ${next_()}`); params.push(category); }
    if (minPrice) { conditions.push(`p."Price" >= ${next_()}`); params.push(minPrice); }
    if (maxPrice) { conditions.push(`p."Price" <= ${next_()}`); params.push(maxPrice); }
    if (purity) { conditions.push(`p."Purity" = ${next_()}`); params.push(purity); }
    if (availability === 'in-stock') conditions.push('p."Quantity" > 0');
    if (availability === 'out-of-stock') conditions.push('p."Quantity" = 0');
    if (featured === 'true') conditions.push('p."IsFeatured" = true');
    if (bestSelling === 'true') conditions.push('p."IsBestSelling" = true');

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap = {
      newest: 'p."CreatedAt" DESC',
      priceLowHigh: 'p."Price" ASC',
      priceHighLow: 'p."Price" DESC',
      nameAZ: 'p."NameEn" ASC',
    };
    const orderBy = sortMap[sortBy] || sortMap.newest;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    // params so far are shared by both the data query and the count query;
    // the LIMIT/OFFSET placeholders are appended only for the data query.
    const sharedParams = [...params];
    const limitPlaceholder = `$${sharedParams.length + 1}`;
    const offsetPlaceholder = `$${sharedParams.length + 2}`;

    const dataQuery = `
      SELECT p.*, c."NameEn" AS "CategoryName", c."Slug" AS "CategorySlug",
        (SELECT "ImageUrl" FROM "ProductImages" pi WHERE pi."ProductId" = p."ProductId"
          ORDER BY pi."IsPrimary" DESC, pi."DisplayOrder" ASC LIMIT 1) AS "PrimaryImage"
      FROM "Products" p
      INNER JOIN "Categories" c ON p."CategoryId" = c."CategoryId"
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM "Products" p
      INNER JOIN "Categories" c ON p."CategoryId" = c."CategoryId"
      ${whereClause}`;

    const { rows: dataRows } = await pool.query(dataQuery, [...sharedParams, pageSize, offset]);
    const { rows: countRows } = await pool.query(countQuery, sharedParams);
    const total = Number(countRows[0].total);

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
    const { rows: productRows } = await pool.query(
      `SELECT p.*, c."NameEn" AS "CategoryName", c."Slug" AS "CategorySlug"
       FROM "Products" p INNER JOIN "Categories" c ON p."CategoryId" = c."CategoryId"
       WHERE p."Slug" = $1`,
      [req.params.slug]
    );

    const product = productRows[0];
    if (!product) throw new ApiError(404, 'Product not found.');

    const { rows: images } = await pool.query(
      'SELECT * FROM "ProductImages" WHERE "ProductId" = $1 ORDER BY "IsPrimary" DESC, "DisplayOrder" ASC',
      [product.ProductId]
    );

    const { rows: similar } = await pool.query(
      `SELECT p.*,
        (SELECT "ImageUrl" FROM "ProductImages" pi WHERE pi."ProductId" = p."ProductId"
          ORDER BY pi."IsPrimary" DESC LIMIT 1) AS "PrimaryImage"
       FROM "Products" p
       WHERE p."CategoryId" = $1 AND p."ProductId" != $2
       ORDER BY p."CreatedAt" DESC LIMIT 4`,
      [product.CategoryId, product.ProductId]
    );

    // increment view count (fire and forget)
    pool.query('UPDATE "Products" SET "ViewCount" = "ViewCount" + 1 WHERE "ProductId" = $1', [product.ProductId]).catch(() => {});

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

    const { rows: inserted } = await pool.query(
      `INSERT INTO "Products"
        ("JewelleryNumber", "NameEn", "NameMr", "Slug", "CategoryId", "Price", "Weight", "Purity", "Quantity", "IsFeatured", "IsBestSelling", "DescriptionEn", "DescriptionMr")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING "ProductId"`,
      [
        jewelleryNumber, nameEn, nameMr || null, slug, parseInt(categoryId, 10), price, weight, purity,
        quantity || 0,
        isFeatured === 'true' || isFeatured === true,
        isBestSelling === 'true' || isBestSelling === true,
        descriptionEn || null, descriptionMr || null,
      ]
    );

    const productId = inserted[0].ProductId;

    if (req.files && req.files.length) {
      for (let idx = 0; idx < req.files.length; idx++) {
        const file = req.files[idx];
        await pool.query(
          'INSERT INTO "ProductImages" ("ProductId", "ImageUrl", "IsPrimary", "DisplayOrder") VALUES ($1, $2, $3, $4)',
          [productId, `/uploads/products/${file.filename}`, idx === 0, idx]
        );
      }
    }

    const { rows } = await pool.query('SELECT * FROM "Products" WHERE "ProductId" = $1', [productId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id  (admin)
async function updateProduct(req, res, next) {
  try {
    const { rows: existingRows } = await pool.query('SELECT * FROM "Products" WHERE "ProductId" = $1', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) throw new ApiError(404, 'Product not found.');

    const b = req.body;
    const val = (key, fallback) => (b[key] !== undefined && b[key] !== '' ? b[key] : fallback);

    await pool.query(
      `UPDATE "Products" SET
        "JewelleryNumber"=$1, "NameEn"=$2, "NameMr"=$3, "CategoryId"=$4, "Price"=$5, "Weight"=$6, "Purity"=$7, "Quantity"=$8,
        "IsFeatured"=$9, "IsBestSelling"=$10, "IsAvailable"=$11, "DescriptionEn"=$12, "DescriptionMr"=$13, "UpdatedAt"=NOW()
       WHERE "ProductId"=$14`,
      [
        val('jewelleryNumber', existing.JewelleryNumber),
        val('nameEn', existing.NameEn),
        val('nameMr', existing.NameMr),
        parseInt(val('categoryId', existing.CategoryId), 10),
        val('price', existing.Price),
        val('weight', existing.Weight),
        val('purity', existing.Purity),
        val('quantity', existing.Quantity),
        b.isFeatured !== undefined ? (b.isFeatured === 'true' || b.isFeatured === true) : existing.IsFeatured,
        b.isBestSelling !== undefined ? (b.isBestSelling === 'true' || b.isBestSelling === true) : existing.IsBestSelling,
        b.isAvailable !== undefined ? (b.isAvailable === 'true' || b.isAvailable === true) : existing.IsAvailable,
        val('descriptionEn', existing.DescriptionEn),
        val('descriptionMr', existing.DescriptionMr),
        req.params.id,
      ]
    );

    if (req.files && req.files.length) {
      for (let idx = 0; idx < req.files.length; idx++) {
        const file = req.files[idx];
        await pool.query(
          'INSERT INTO "ProductImages" ("ProductId", "ImageUrl", "IsPrimary", "DisplayOrder") VALUES ($1, $2, $3, $4)',
          [req.params.id, `/uploads/products/${file.filename}`, false, idx]
        );
      }
    }

    const { rows } = await pool.query('SELECT * FROM "Products" WHERE "ProductId" = $1', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id  (admin)
async function deleteProduct(req, res, next) {
  try {
    const { rows: images } = await pool.query('SELECT "ImageUrl" FROM "ProductImages" WHERE "ProductId" = $1', [req.params.id]);

    await pool.query('DELETE FROM "Products" WHERE "ProductId" = $1', [req.params.id]); // ProductImages cascade

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
    const { rows } = await pool.query('SELECT * FROM "ProductImages" WHERE "ImageId" = $1', [req.params.imageId]);
    if (!rows[0]) throw new ApiError(404, 'Image not found.');

    await pool.query('DELETE FROM "ProductImages" WHERE "ImageId" = $1', [req.params.imageId]);

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
