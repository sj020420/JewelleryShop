const { pool } = require('../config/db');

// GET /api/settings  (public)
async function getSettings(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM "WebsiteSettings" ORDER BY "SettingId" ASC LIMIT 1');
    res.json({ success: true, data: rows[0] || {} });
  } catch (err) {
    next(err);
  }
}

// PUT /api/settings  (admin) - upserts the single settings row
async function updateSettings(req, res, next) {
  try {
    const { rows: existingRows } = await pool.query('SELECT * FROM "WebsiteSettings" ORDER BY "SettingId" ASC LIMIT 1');
    const existing = existingRows[0];
    const b = req.body;
    const val = (key, fallback) => (b[key] !== undefined ? b[key] : fallback);

    const logoUrl = req.file ? `/uploads/settings/${req.file.filename}` : val('logoUrl', existing?.LogoUrl);

    if (existing) {
      await pool.query(
        `UPDATE "WebsiteSettings" SET
          "ShopName"=$1, "LogoUrl"=$2, "ContactNumber"=$3, "WhatsAppNumber"=$4, "Address"=$5, "Email"=$6,
          "AboutUsEn"=$7, "AboutUsMr"=$8, "FacebookUrl"=$9, "InstagramUrl"=$10, "YoutubeUrl"=$11,
          "PrivacyPolicyEn"=$12, "PrivacyPolicyMr"=$13, "TermsEn"=$14, "TermsMr"=$15, "FooterText"=$16, "UpdatedAt"=NOW()
         WHERE "SettingId"=$17`,
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
      const { rows } = await pool.query('SELECT * FROM "WebsiteSettings" WHERE "SettingId" = $1', [existing.SettingId]);
      return res.json({ success: true, data: rows[0] });
    }

    // No row yet - insert first row
    const { rows: inserted } = await pool.query(
      `INSERT INTO "WebsiteSettings" ("ShopName", "LogoUrl", "ContactNumber", "WhatsAppNumber")
       VALUES ($1, $2, $3, $4)
       RETURNING "SettingId"`,
      [val('shopName', 'साज by Anita Jewellery'), logoUrl, val('contactNumber', null), val('whatsAppNumber', '919423033383')]
    );
    const { rows } = await pool.query('SELECT * FROM "WebsiteSettings" WHERE "SettingId" = $1', [inserted[0].SettingId]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
