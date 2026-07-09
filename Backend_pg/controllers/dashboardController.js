const { pool } = require('../config/db');

// GET /api/dashboard/summary  (admin)
async function getSummary(req, res, next) {
  try {
    const { rows: summaryRows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM "Products")                                 AS "TotalProducts",
        (SELECT COUNT(*) FROM "Categories")                               AS "TotalCategories",
        (SELECT COALESCE(SUM("Quantity"),0) FROM "Products")              AS "TotalStock",
        (SELECT COUNT(*) FROM "Products" WHERE "Quantity" = 0)            AS "OutOfStock",
        (SELECT COUNT(*) FROM "Products" WHERE "IsFeatured" = true)       AS "FeaturedProducts",
        (SELECT COALESCE(SUM("ViewCount"),0) FROM "Products")             AS "ProductViews",
        (SELECT COUNT(*) FROM "InquiryHistory")                          AS "InquiryCount",
        (SELECT COUNT(*) FROM "InquiryHistory" WHERE "Status" = 'Pending') AS "PendingInquiries"
    `);

    const { rows: monthlyRows } = await pool.query(`
      SELECT TO_CHAR("CreatedAt", 'YYYY-MM') AS "Month", COUNT(*) AS "InquiryCount"
      FROM "InquiryHistory"
      WHERE "CreatedAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("CreatedAt", 'YYYY-MM')
      ORDER BY "Month"
    `);

    const { rows: recentRows } = await pool.query(`
      SELECT p.*, c."NameEn" AS "CategoryName", c."Slug" AS "CategorySlug",
        (SELECT "ImageUrl" FROM "ProductImages" pi WHERE pi."ProductId" = p."ProductId"
          ORDER BY pi."IsPrimary" DESC LIMIT 1) AS "PrimaryImage"
      FROM "Products" p
      INNER JOIN "Categories" c ON p."CategoryId" = c."CategoryId"
      ORDER BY p."CreatedAt" DESC LIMIT 5
    `);

    // COUNT()/SUM() come back as strings from pg (bigint/numeric) — normalize to numbers
    const summary = summaryRows[0];
    const numericFields = [
      'TotalProducts', 'TotalCategories', 'TotalStock', 'OutOfStock',
      'FeaturedProducts', 'ProductViews', 'InquiryCount', 'PendingInquiries',
    ];
    numericFields.forEach((f) => { summary[f] = Number(summary[f]); });

    const monthlyInquiries = monthlyRows.map((r) => ({ ...r, InquiryCount: Number(r.InquiryCount) }));

    res.json({
      success: true,
      data: {
        ...summary,
        monthlyInquiries,
        recentProducts: recentRows,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
