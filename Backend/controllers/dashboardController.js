const { pool } = require('../config/db');

// GET /api/dashboard/summary  (admin)
async function getSummary(req, res, next) {
  try {
    const [summaryRows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM Products)                               AS TotalProducts,
        (SELECT COUNT(*) FROM Categories)                             AS TotalCategories,
        (SELECT IFNULL(SUM(Quantity),0) FROM Products)                AS TotalStock,
        (SELECT COUNT(*) FROM Products WHERE Quantity = 0)            AS OutOfStock,
        (SELECT COUNT(*) FROM Products WHERE IsFeatured = 1)          AS FeaturedProducts,
        (SELECT IFNULL(SUM(ViewCount),0) FROM Products)               AS ProductViews,
        (SELECT COUNT(*) FROM InquiryHistory)                         AS InquiryCount,
        (SELECT COUNT(*) FROM InquiryHistory WHERE Status = 'Pending') AS PendingInquiries
    `);

    const [monthlyRows] = await pool.query(`
      SELECT DATE_FORMAT(CreatedAt, '%Y-%m') AS Month, COUNT(*) AS InquiryCount
      FROM InquiryHistory
      WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(CreatedAt, '%Y-%m')
      ORDER BY Month
    `);

    const [recentRows] = await pool.query(`
      SELECT p.*,
        (SELECT ImageUrl FROM ProductImages pi WHERE pi.ProductId = p.ProductId
          ORDER BY pi.IsPrimary DESC LIMIT 1) AS PrimaryImage
      FROM Products p ORDER BY p.CreatedAt DESC LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        ...summaryRows[0],
        monthlyInquiries: monthlyRows,
        recentProducts: recentRows,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
