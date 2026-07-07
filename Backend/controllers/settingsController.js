const { pool } = require('../config/db');

// GET /api/settings  (public)
async function getSettings(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM WebsiteSettings ORDER BY SettingId ASC LIMIT 1');
    res.json({ success: true, data: rows[0] || {} });
  } catch (err) {
    next(err);
  }
}

// PUT /api/settings  (admin) - upserts the single settings row
async function updateSettings(req, res, next) {
  try {
    const [existingRows] = await pool.query('SELECT * FROM WebsiteSettings ORDER BY SettingId ASC LIMIT 1');
    const existing = existingRows[0];
    const b = req.body;
    const val = (key, fallback) => (b[key] !== undefined ? b[key] : fallback);

    const logoUrl = req.file ? `/uploads/settings/${req.file.filename}` : val('logoUrl', existing?.LogoUrl);

    if (existing) {
      await pool.query(
        `UPDATE WebsiteSettings SET
          ShopName=?, LogoUrl=?, ContactNumber=?, WhatsAppNumber=?, Address=?, Email=?,
          AboutUsEn=?, AboutUsMr=?, FacebookUrl=?, InstagramUrl=?, YoutubeUrl=?,
          PrivacyPolicyEn=?, PrivacyPolicyMr=?, TermsEn=?, TermsMr=?, FooterText=?, UpdatedAt=NOW()
         WHERE SettingId=?`,
        [
          val('shopName', existing.ShopName),
          logoUrl,
          val('contactNumber', existing.ContactNumber),
          val('whatsAppNumber', existing.WhatsAppNumber),
          val('address', existing.Address),
          val('email', existing.Email),
          val('aboutUsEn', existing.AboutUsEn),
          val('aboutUsMr', existing.AboutUsMr),
          val('facebookUrl', existing.FacebookUrl),
          val('instagramUrl', existing.InstagramUrl),
          val('youtubeUrl', existing.YoutubeUrl),
          val('privacyPolicyEn', existing.PrivacyPolicyEn),
          val('privacyPolicyMr', existing.PrivacyPolicyMr),
          val('termsEn', existing.TermsEn),
          val('termsMr', existing.TermsMr),
          val('footerText', existing.FooterText),
          existing.SettingId,
        ]
      );
      const [rows] = await pool.query('SELECT * FROM WebsiteSettings WHERE SettingId = ?', [existing.SettingId]);
      return res.json({ success: true, data: rows[0] });
    }

    // No row yet - insert first row
    const [result] = await pool.query(
      `INSERT INTO WebsiteSettings (ShopName, LogoUrl, ContactNumber, WhatsAppNumber)
       VALUES (?, ?, ?, ?)`,
      [val('shopName', 'साज by Anita Jewellery'), logoUrl, val('contactNumber', null), val('whatsAppNumber', '919423033383')]
    );
    const [rows] = await pool.query('SELECT * FROM WebsiteSettings WHERE SettingId = ?', [result.insertId]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
