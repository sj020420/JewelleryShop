/* =========================================================================
 saaj by Anita Jewellery - Database Script
   MySQL 8.0+ / MariaDB 10.6+ (tested with MariaDB 10.11)
   =========================================================================
   Import this file in MySQL Workbench (File > Run SQL Script), or:
     mysql -u root -p < JewelleryShop.sql
   ========================================================================= */

CREATE DATABASE IF NOT EXISTS JewelleryShop
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE JewelleryShop;

/* -------------------------------------------------------------------------
   Drop tables if re-running (children first)
   ------------------------------------------------------------------------- */
DROP TABLE IF EXISTS InquiryHistory;
DROP TABLE IF EXISTS Wishlist;
DROP TABLE IF EXISTS ProductImages;
DROP TABLE IF EXISTS Offers;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Testimonials;Admin
DROP TABLE IF EXISTS HeroBanner;
DROP TABLE IF EXISTS WebsiteSettings;
DROP TABLE IF EXISTS Admin;

/* -------------------------------------------------------------------------
   Admin
   ------------------------------------------------------------------------- */
CREATE TABLE Admin (
    AdminId         INT AUTO_INCREMENT PRIMARY KEY,
    FullName        VARCHAR(100)  NOT NULL,
    Email           VARCHAR(150)  NOT NULL UNIQUE,
    PasswordHash    VARCHAR(255)  NOT NULL,
    Role            VARCHAR(30)   NOT NULL DEFAULT 'Admin',
    ProfileImage    VARCHAR(255)  NULL,
    IsActive        TINYINT(1)    NOT NULL DEFAULT 1,
    CreatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* -------------------------------------------------------------------------
   Categories
   ------------------------------------------------------------------------- */
CREATE TABLE Categories (
    CategoryId      INT AUTO_INCREMENT PRIMARY KEY,
    NameEn          VARCHAR(100)  NOT NULL,
    NameMr          VARCHAR(100)  NULL,
    Slug            VARCHAR(120)  NOT NULL UNIQUE,
    Description     VARCHAR(500)  NULL,
    ImageUrl        VARCHAR(255)  NULL,
    IsActive        TINYINT(1)    NOT NULL DEFAULT 1,
    DisplayOrder    INT           NOT NULL DEFAULT 0,
    CreatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX IX_Categories_Slug (Slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* -------------------------------------------------------------------------
   Products
   ------------------------------------------------------------------------- */
CREATE TABLE Products (
    ProductId       INT AUTO_INCREMENT PRIMARY KEY,
    JewelleryNumber VARCHAR(50)   NOT NULL UNIQUE,
    NameEn          VARCHAR(200)  NOT NULL,
    NameMr          VARCHAR(200)  NULL,
    Slug            VARCHAR(220)  NOT NULL UNIQUE,
    CategoryId      INT           NOT NULL,
    Price           DECIMAL(12,2) NOT NULL,
    Weight          DECIMAL(8,3)  NOT NULL, -- grams
    Purity          VARCHAR(20)   NOT NULL, -- e.g. 22K, 18K, 916
    Quantity        INT           NOT NULL DEFAULT 0,
    IsAvailable     TINYINT(1)    NOT NULL DEFAULT 1,
    IsFeatured      TINYINT(1)    NOT NULL DEFAULT 0,
    IsBestSelling   TINYINT(1)    NOT NULL DEFAULT 0,
    DescriptionEn   TEXT          NULL,
    DescriptionMr   TEXT          NULL,
    ViewCount       INT           NOT NULL DEFAULT 0,
    CreatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_Products_Category FOREIGN KEY (CategoryId)
        REFERENCES Categories(CategoryId),
    INDEX IX_Products_Category (CategoryId),
    INDEX IX_Products_Slug (Slug),
    INDEX IX_Products_Featured (IsFeatured),
    INDEX IX_Products_Availability (IsAvailable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* -------------------------------------------------------------------------
   ProductImages
   ------------------------------------------------------------------------- */
CREATE TABLE ProductImages (
    ImageId         INT AUTO_INCREMENT PRIMARY KEY,
    ProductId       INT           NOT NULL,
    ImageUrl        VARCHAR(255)  NOT NULL,
    IsPrimary       TINYINT(1)    NOT NULL DEFAULT 0,
    DisplayOrder    INT           NOT NULL DEFAULT 0,
    CreatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_ProductImages_Product FOREIGN KEY (ProductId)
        REFERENCES Products(ProductId) ON DELETE CASCADE,
    INDEX IX_ProductImages_Product (ProductId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* -------------------------------------------------------------------------
   Wishlist (customer identified by a device/session token - no login
   required for customers, matching the requirement that only Admin logs in)
   ------------------------------------------------------------------------- */
CREATE TABLE Wishlist (
    WishlistId      INT AUTO_INCREMENT PRIMARY KEY,
    DeviceToken     VARCHAR(100)  NOT NULL,
    ProductId       INT           NOT NULL,
    CreatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Wishlist_Product FOREIGN KEY (ProductId)
        REFERENCES Products(ProductId) ON DELETE CASCADE,
    CONSTRAINT UQ_Wishlist_Device_Product UNIQUE (DeviceToken, ProductId),
    INDEX IX_Wishlist_Device (DeviceToken)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* -------------------------------------------------------------------------
   InquiryHistory (Buy Now / Contact enquiries)
   ------------------------------------------------------------------------- */
CREATE TABLE InquiryHistory (
    InquiryId       INT AUTO_INCREMENT PRIMARY KEY,
    CustomerName    VARCHAR(150)  NOT NULL,
    MobileNumber    VARCHAR(20)   NOT NULL,
    ProductId       INT           NULL,
    Message         VARCHAR(1000) NULL,
    Status          VARCHAR(20)   NOT NULL DEFAULT 'Pending', -- Pending / Contacted / Closed
    CreatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_Inquiry_Product FOREIGN KEY (ProductId)
        REFERENCES Products(ProductId) ON DELETE SET NULL,
    CONSTRAINT CK_Inquiry_Status CHECK (Status IN ('Pending','Contacted','Closed')),
    INDEX IX_Inquiry_Status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* -------------------------------------------------------------------------
   WebsiteSettings (single-row config table, editable from Admin)
   ------------------------------------------------------------------------- */
CREATE TABLE WebsiteSettings (
    SettingId       INT AUTO_INCREMENT PRIMARY KEY,
    ShopName        VARCHAR(150)  NOT NULL DEFAULT 'साज by Anita Jewellery',
    LogoUrl         VARCHAR(255)  NULL,
    ContactNumber   VARCHAR(20)   NULL,
    WhatsAppNumber  VARCHAR(20)   NULL DEFAULT '919423033383',
    Address         VARCHAR(300)  NULL,
    Email           VARCHAR(150)  NULL,
    AboutUsEn       TEXT          NULL,
    AboutUsMr       TEXT          NULL,
    FacebookUrl     VARCHAR(255)  NULL,
    InstagramUrl    VARCHAR(255)  NULL,
    YoutubeUrl      VARCHAR(255)  NULL,
    PrivacyPolicyEn TEXT          NULL,
    PrivacyPolicyMr TEXT          NULL,
    TermsEn         TEXT          NULL,
    TermsMr         TEXT          NULL,
    FooterText      VARCHAR(500)  NULL,
    UpdatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* -------------------------------------------------------------------------
   HeroBanner
   ------------------------------------------------------------------------- */
CREATE TABLE HeroBanner (
    BannerId        INT AUTO_INCREMENT PRIMARY KEY,
    TitleEn         VARCHAR(200)  NULL,
    TitleMr         VARCHAR(200)  NULL,
    SubtitleEn      VARCHAR(300)  NULL,
    SubtitleMr      VARCHAR(300)  NULL,
    ImageUrl        VARCHAR(255)  NOT NULL,
    LinkUrl         VARCHAR(255)  NULL,
    DisplayOrder    INT           NOT NULL DEFAULT 0,
    IsActive        TINYINT(1)    NOT NULL DEFAULT 1,
    CreatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* -------------------------------------------------------------------------
   Testimonials
   ------------------------------------------------------------------------- */
CREATE TABLE Testimonials (
    TestimonialId   INT AUTO_INCREMENT PRIMARY KEY,
    CustomerName    VARCHAR(150)  NOT NULL,
    CustomerImage   VARCHAR(255)  NULL,
    Rating          TINYINT       NOT NULL DEFAULT 5,
    MessageEn       VARCHAR(500)  NOT NULL,
    MessageMr       VARCHAR(500)  NULL,
    IsActive        TINYINT(1)    NOT NULL DEFAULT 1,
    CreatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CK_Testimonial_Rating CHECK (Rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* -------------------------------------------------------------------------
   Offers
   ------------------------------------------------------------------------- */
CREATE TABLE Offers (
    OfferId         INT AUTO_INCREMENT PRIMARY KEY,
    TitleEn         VARCHAR(200)  NOT NULL,
    TitleMr         VARCHAR(200)  NULL,
    DescriptionEn   VARCHAR(500)  NULL,
    DescriptionMr   VARCHAR(500)  NULL,
    ImageUrl        VARCHAR(255)  NULL,
    StartDate       DATE          NULL,
    EndDate         DATE          NULL,
    IsActive        TINYINT(1)    NOT NULL DEFAULT 1,
    CreatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================================
   Stored Procedures (optional - the Node backend queries tables directly
   and does not call these, but they're provided for completeness / anyone
   who prefers to query analytics straight from MySQL Workbench)
   ========================================================================= */

DELIMITER $$

CREATE PROCEDURE sp_DashboardSummary()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM Products)                                AS TotalProducts,
        (SELECT COUNT(*) FROM Categories)                              AS TotalCategories,
        (SELECT IFNULL(SUM(Quantity),0) FROM Products)                 AS TotalStock,
        (SELECT COUNT(*) FROM Products WHERE Quantity = 0)              AS OutOfStock,
        (SELECT COUNT(*) FROM Products WHERE IsFeatured = 1)            AS FeaturedProducts,
        (SELECT IFNULL(SUM(ViewCount),0) FROM Products)                 AS ProductViews,
        (SELECT COUNT(*) FROM InquiryHistory)                           AS InquiryCount,
        (SELECT COUNT(*) FROM InquiryHistory WHERE Status = 'Pending')  AS PendingInquiries;
END$$

CREATE PROCEDURE sp_MonthlyInquiryAnalytics()
BEGIN
    SELECT
        DATE_FORMAT(CreatedAt, '%Y-%m') AS Month,
        COUNT(*) AS InquiryCount
    FROM InquiryHistory
    WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(CreatedAt, '%Y-%m')
    ORDER BY Month;
END$$

DELIMITER ;

/* =========================================================================
   Sample / Seed Data
   ========================================================================= */

-- Default admin: email admin@sajbyanita.com / password Admin@123
-- (PasswordHash below is a real bcryptjs hash, 10 salt rounds, for "Admin@123")
INSERT INTO Admin (FullName, Email, PasswordHash, Role)
VALUES ('Anita', 'admin@sajbyanita.com', '$2a$10$Z/BuWZUOJiX6SKAyGuw6TeISKCMMTPEE39mW5SvKTJGYij3y9YX4y', 'SuperAdmin');

INSERT INTO Categories (NameEn, NameMr, Slug, Description, DisplayOrder) VALUES
('Necklaces', 'नेकलेस', 'necklaces', 'Traditional and modern necklaces', 1),
('Earrings', 'कानातले', 'earrings', 'Elegant earrings for every occasion', 2),
('Bangles', 'बांगड्या', 'bangles', 'Gold and diamond bangles', 3),
('Rings', 'अंगठ्या', 'rings', 'Engagement and daily wear rings', 4),
('Mangalsutra', 'मंगळसूत्र', 'mangalsutra', 'Traditional mangalsutra designs', 5);

INSERT INTO Products
(JewelleryNumber, NameEn, NameMr, Slug, CategoryId, Price, Weight, Purity, Quantity, IsFeatured, IsBestSelling, DescriptionEn)
VALUES
('SAJ-N001', 'Kundan Bridal Necklace', 'कुंदन ब्रायडल नेकलेस', 'kundan-bridal-necklace', 1, 185000.00, 42.500, '22K', 3, 1, 1, 'Handcrafted kundan necklace with intricate detailing, perfect for weddings.'),
('SAJ-E001', 'Peacock Jhumka Earrings', 'मोर झुमका', 'peacock-jhumka-earrings', 2, 42500.00, 12.300, '22K', 8, 1, 0, 'Traditional peacock-inspired jhumka earrings with pearl drops.'),
('SAJ-B001', 'Antique Gold Bangles (Pair)', 'अँटिक गोल्ड बांगड्या', 'antique-gold-bangles-pair', 3, 96000.00, 24.000, '22K', 5, 0, 1, 'Set of two antique-finish gold bangles with temple motifs.'),
('SAJ-R001', 'Solitaire Diamond Ring', 'सॉलिटेअर डायमंड रिंग', 'solitaire-diamond-ring', 4, 68000.00, 4.200, '18K', 6, 1, 1, 'Classic solitaire diamond ring set in 18K white gold.'),
('SAJ-M001', 'Vati Mangalsutra', 'वाटी मंगळसूत्र', 'vati-mangalsutra', 5, 54500.00, 15.800, '22K', 10, 0, 0, 'Traditional vati-style mangalsutra with black beads chain.');

INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, DisplayOrder) VALUES
(1, '/uploads/products/sample-necklace-1.jpg', 1, 1),
(2, '/uploads/products/sample-earrings-1.jpg', 1, 1),
(3, '/uploads/products/sample-bangles-1.jpg', 1, 1),
(4, '/uploads/products/sample-ring-1.jpg', 1, 1),
(5, '/uploads/products/sample-mangalsutra-1.jpg', 1, 1);

INSERT INTO WebsiteSettings
(ShopName, ContactNumber, WhatsAppNumber, Address, Email, AboutUsEn, FooterText)
VALUES
('साज by Anita Jewellery', '9423033383', '919423033383',
 'Anita Jewellery, Main Market Road, Maharashtra, India', 'contact@sajbyanita.com',
 'साज by Anita Jewellery brings you handcrafted, traditional and contemporary jewellery designs, made with trust and passed down craftsmanship.',
 '© 2026 साज by Anita Jewellery. All rights reserved.');

INSERT INTO Testimonials (CustomerName, Rating, MessageEn) VALUES
('Priya Deshmukh', 5, 'Beautiful craftsmanship and excellent service. My bridal set was exactly what I dreamed of.'),
('Sneha Patil', 5, 'Loved the mangalsutra design, very traditional and elegant.'),
('Kavita Joshi', 4, 'Great collection and quick response on WhatsApp for inquiries.');

INSERT INTO HeroBanner (TitleEn, SubtitleEn, ImageUrl, DisplayOrder) VALUES
('Timeless Elegance, Handcrafted for You', 'Discover our exclusive gold & diamond collection', '/uploads/banners/hero-1.jpg', 1);

SELECT 'JewelleryShop database created and seeded successfully.' AS Status;
