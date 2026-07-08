-- ============================================================================
-- Saj by Anita Jewellery — PostgreSQL schema (Neon)
--
-- NOTE: Your original MySQL project did not include a CREATE TABLE / schema
-- file (only an ad-hoc "Untitled.sql" with UPDATE/SELECT statements). This
-- schema was reverse-engineered from every column referenced across your
-- controllers. Please diff this against your real MySQL schema (e.g. via
-- `SHOW CREATE TABLE` on each table) before running it, in case there are
-- columns/constraints your code doesn't touch directly (e.g. extra indexes).
--
-- All identifiers are double-quoted to preserve the exact PascalCase names
-- your JavaScript code already reads (e.g. row.AdminId, row.PasswordHash).
-- Postgres lowercases unquoted identifiers, which would otherwise break
-- every property access in your controllers.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "Admin" (
  "AdminId"       SERIAL PRIMARY KEY,
  "FullName"      VARCHAR(150) NOT NULL,
  "Email"         VARCHAR(150) NOT NULL UNIQUE,
  "PasswordHash"  VARCHAR(255) NOT NULL,
  "Role"          VARCHAR(50)  NOT NULL DEFAULT 'Admin',
  "ProfileImage"  VARCHAR(255),
  "IsActive"      BOOLEAN NOT NULL DEFAULT TRUE,
  "CreatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "UpdatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Categories" (
  "CategoryId"    SERIAL PRIMARY KEY,
  "NameEn"        VARCHAR(150) NOT NULL,
  "NameMr"        VARCHAR(150),
  "Slug"          VARCHAR(180) NOT NULL UNIQUE,
  "Description"   TEXT,
  "DisplayOrder"  INTEGER NOT NULL DEFAULT 0,
  "IsActive"      BOOLEAN NOT NULL DEFAULT TRUE,
  "CreatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "UpdatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Products" (
  "ProductId"       SERIAL PRIMARY KEY,
  "JewelleryNumber" VARCHAR(100) NOT NULL UNIQUE,
  "NameEn"          VARCHAR(200) NOT NULL,
  "NameMr"          VARCHAR(200),
  "Slug"            VARCHAR(220) NOT NULL UNIQUE,
  "CategoryId"      INTEGER NOT NULL REFERENCES "Categories"("CategoryId"),
  "Price"           NUMERIC(12,2) NOT NULL,
  "Weight"          NUMERIC(10,3) NOT NULL,
  "Purity"          VARCHAR(20) NOT NULL,
  "Quantity"        INTEGER NOT NULL DEFAULT 0,
  "IsFeatured"      BOOLEAN NOT NULL DEFAULT FALSE,
  "IsBestSelling"   BOOLEAN NOT NULL DEFAULT FALSE,
  "IsAvailable"     BOOLEAN NOT NULL DEFAULT TRUE,
  "DescriptionEn"   TEXT,
  "DescriptionMr"   TEXT,
  "ViewCount"       INTEGER NOT NULL DEFAULT 0,
  "CreatedAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "UpdatedAt"       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ProductImages" (
  "ImageId"       SERIAL PRIMARY KEY,
  "ProductId"     INTEGER NOT NULL REFERENCES "Products"("ProductId") ON DELETE CASCADE,
  "ImageUrl"      VARCHAR(255) NOT NULL,
  "IsPrimary"     BOOLEAN NOT NULL DEFAULT FALSE,
  "DisplayOrder"  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "Wishlist" (
  "WishlistId"   SERIAL PRIMARY KEY,
  "DeviceToken"  VARCHAR(255) NOT NULL,
  "ProductId"    INTEGER NOT NULL REFERENCES "Products"("ProductId") ON DELETE CASCADE,
  "CreatedAt"    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE ("DeviceToken", "ProductId")
);

CREATE TABLE IF NOT EXISTS "InquiryHistory" (
  "InquiryId"     SERIAL PRIMARY KEY,
  "CustomerName"  VARCHAR(150) NOT NULL,
  "MobileNumber"  VARCHAR(20) NOT NULL,
  "ProductId"     INTEGER REFERENCES "Products"("ProductId") ON DELETE SET NULL,
  "Message"       TEXT,
  "Status"        VARCHAR(20) NOT NULL DEFAULT 'Pending',
  "CreatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "UpdatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "WebsiteSettings" (
  "SettingId"        SERIAL PRIMARY KEY,
  "ShopName"         VARCHAR(200),
  "LogoUrl"          VARCHAR(255),
  "ContactNumber"    VARCHAR(20),
  "WhatsAppNumber"   VARCHAR(20),
  "Address"          TEXT,
  "Email"            VARCHAR(150),
  "AboutUsEn"        TEXT,
  "AboutUsMr"        TEXT,
  "FacebookUrl"      VARCHAR(255),
  "InstagramUrl"     VARCHAR(255),
  "YoutubeUrl"       VARCHAR(255),
  "PrivacyPolicyEn"  TEXT,
  "PrivacyPolicyMr"  TEXT,
  "TermsEn"          TEXT,
  "TermsMr"          TEXT,
  "FooterText"       TEXT,
  "CreatedAt"        TIMESTAMP NOT NULL DEFAULT NOW(),
  "UpdatedAt"        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Helpful indexes matching your query patterns (WHERE / JOIN / ORDER BY columns)
CREATE INDEX IF NOT EXISTS idx_products_categoryid   ON "Products" ("CategoryId");
CREATE INDEX IF NOT EXISTS idx_products_createdat     ON "Products" ("CreatedAt");
CREATE INDEX IF NOT EXISTS idx_productimages_productid ON "ProductImages" ("ProductId");
CREATE INDEX IF NOT EXISTS idx_wishlist_devicetoken    ON "Wishlist" ("DeviceToken");
CREATE INDEX IF NOT EXISTS idx_inquiryhistory_status   ON "InquiryHistory" ("Status");
CREATE INDEX IF NOT EXISTS idx_inquiryhistory_createdat ON "InquiryHistory" ("CreatedAt");
