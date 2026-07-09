const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/wishlist/:deviceToken
async function getWishlist(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT w."WishlistId", p.*, c."NameEn" AS "CategoryName", c."Slug" AS "CategorySlug",
        (SELECT "ImageUrl" FROM "ProductImages" pi WHERE pi."ProductId" = p."ProductId"
          ORDER BY pi."IsPrimary" DESC LIMIT 1) AS "PrimaryImage"
       FROM "Wishlist" w
       INNER JOIN "Products" p ON w."ProductId" = p."ProductId"
       INNER JOIN "Categories" c ON p."CategoryId" = c."CategoryId"
       WHERE w."DeviceToken" = $1
       ORDER BY w."CreatedAt" DESC`,
      [req.params.deviceToken]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/wishlist  { deviceToken, productId }
async function addToWishlist(req, res, next) {
  try {
    const { deviceToken, productId } = req.body;
    if (!deviceToken || !productId) throw new ApiError(400, 'deviceToken and productId are required.');

    const { rows: existing } = await pool.query(
      'SELECT * FROM "Wishlist" WHERE "DeviceToken" = $1 AND "ProductId" = $2',
      [deviceToken, productId]
    );

    if (existing[0]) {
      return res.json({ success: true, message: 'Already in wishlist.' });
    }

    await pool.query('INSERT INTO "Wishlist" ("DeviceToken", "ProductId") VALUES ($1, $2)', [deviceToken, productId]);
    res.status(201).json({ success: true, message: 'Added to wishlist.' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/wishlist  { deviceToken, productId }
async function removeFromWishlist(req, res, next) {
  try {
    const { deviceToken, productId } = req.body;
    await pool.query('DELETE FROM "Wishlist" WHERE "DeviceToken" = $1 AND "ProductId" = $2', [deviceToken, productId]);
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
