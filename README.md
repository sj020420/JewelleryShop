# साज by Anita Jewellery — Full Stack Jewellery Shop

A jewellery shop web application: React.js customer storefront + Node.js/Express API +
MySQL database, with a WhatsApp-based "Buy Now" flow instead of online payment,
and a basic Admin Panel for managing products and categories.

> **Note:** this project originally targeted Microsoft SQL Server and was migrated to
> MySQL (tested against MariaDB 10.11 and compatible with MySQL 8+) so it runs natively on
> macOS with MySQL Workbench — no SQL Server required. The original MSSQL script is kept at
> `Database/JewelleryShop_MSSQL_legacy.sql.bak` for reference only; it is not needed to run the project.

This is **Phase 1** of the build (agreed scope: customer-facing shop first, with a basic admin).
See **"What's included vs. what's next"** below before you assume something is finished.

---

## Project Structure

```
Jewellery-Shop/
├── Frontend/         React.js + Vite + Tailwind CSS (customer site + admin panel)
├── Backend/          Node.js + Express.js REST API
├── Database/
│   └── JewelleryShop.sql   Complete MSSQL schema + seed data
└── README.md          (this file)
```

---

## 1. Database Setup (MySQL / MySQL Workbench)

This project now runs on **MySQL 8+ or MariaDB 10.6+** (tested against MariaDB 10.11) instead of
MSSQL, so it works natively on macOS with MySQL Workbench, no SQL Server needed.

**Option A — MySQL Workbench (GUI)**
1. Open MySQL Workbench and connect to your local server.
2. File → Run SQL Script... → select `Database/JewelleryShop.sql` → Run.
   Workbench handles the UTF-8 (Devanagari) text correctly by default.

**Option B — command line**
```bash
mysql -u root -p --default-character-set=utf8mb4 < Database/JewelleryShop.sql
```
⚠️ **Important:** always include `--default-character-set=utf8mb4` when importing from the
terminal. The `mysql` CLI defaults to `latin1` for the client connection on many installs, and
without this flag the Marathi/Devanagari text in the seed data will get silently corrupted
(double-encoded) on import — it'll still "work", just show mojibake. Workbench's GUI importer
doesn't have this issue.

This creates the `JewelleryShop` database, all tables, foreign keys, indexes, two stored
procedures (`sp_DashboardSummary`, `sp_MonthlyInquiryAnalytics` — provided for convenience if you
want to query analytics directly in Workbench; the Node backend itself queries tables directly
and doesn't call these), and seed data (5 categories, 5 sample products, one admin user).

**Default admin login seeded by the script:**
- Email: `admin@sajbyanita.com`
- Password: `Admin@123`

This works out of the box — the seed script contains a real bcrypt hash for that password.
Change it after your first login (Admin → Profile → change password), or regenerate a hash yourself any time:

```bash
cd Backend
npm install
node utils/hashPassword.js YourNewPassword
# copy the printed hash into: UPDATE Admin SET PasswordHash = '<hash>' WHERE Email = 'admin@sajbyanita.com';
```

---

## 2. Backend Setup

```bash
cd Backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) and a strong JWT_SECRET
npm run dev      # nodemon, or: npm start
```

The API runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

Uploaded images are served statically from `/uploads/...` and stored under `Backend/uploads/`.

---

## 3. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. Vite is configured to proxy `/api` and `/uploads` to
`http://localhost:5000`, so no CORS setup is needed in development.

Customer site: `http://localhost:5173/`
Admin panel: `http://localhost:5173/admin/login`

---

## 4. What's included (Phase 1)

**Customer site**
- Home (hero, categories, featured/latest/best-selling, why-choose-us, testimonials, newsletter form)
- Products listing with search, filters (category, price range, purity, availability), sorting, pagination
- Product details with image gallery + click-to-zoom, similar products
- Categories page
- Wishlist (device-based, no login required — backed by the `Wishlist` table)
- About Us, Contact Us (working enquiry form → `InquiryHistory` table), FAQ, Privacy Policy, Terms & Conditions, 404
- "Buy Now" opens WhatsApp (`wa.me/919423033383`) with a pre-filled message — **no payment gateway**, as specified
- English/Marathi language switcher (core UI strings translated; see notes below)
- Floating WhatsApp button site-wide

**Admin panel**
- Login (JWT-based)
- Dashboard: stats cards (products, categories, stock, out-of-stock, featured, views, inquiries) + monthly inquiry chart + recent products
- Products: add/edit/delete, multi-image upload, mark featured/best-selling, search
- Categories: add/edit/delete

**Backend (all REST, documented below)**
- JWT auth, bcrypt password hashing, Helmet, CORS, parameterized SQL (no string-concatenated queries), centralized error handling, request logging (morgan)
- Full CRUD for Products & Categories, image upload/delete, wishlist, inquiries (create + admin list/status), website settings (get/update), dashboard analytics

**Database**
- All 10 requested tables, foreign keys, indexes, 2 stored procedures, seed data

## 5. What's intentionally NOT built yet (next iteration)

This was scoped as Phase 1 (customer shop first, basic admin) rather than the full spec in one pass, so a few things from the original brief are stubbed or simplified and would need a follow-up round:

- **Inquiry History / Website Settings admin screens** — the APIs exist and are fully working, but there's no admin UI page yet to manage them from the dashboard (currently DB/API only).
- **Hero Banner, Testimonials, Offers management UI** — tables and are seeded, but there's no admin CRUD screen for them yet (Home page currently reads testimonials from a fallback array, not the DB, for simplicity).
- **Marathi coverage** — navigation, buttons and key labels are translated; long-form content (About/FAQ/Terms text) is English-only for now.
- **Charts** on the dashboard are simple CSS bar visualizations, not a charting library — fine for now, easy to upgrade later (e.g. recharts).
- **Stored-procedure usage**: the SQL script still creates `sp_DashboardSummary` and `sp_MonthlyInquiryAnalytics` for convenience if you want to query analytics directly in Workbench, but the Node backend queries tables directly with plain parameterized SQL rather than calling them — simpler to read/maintain and avoids extra round-trip complexity through `mysql2`'s `CALL` result format.
- **Admin Profile page** and **multer file size/type errors** aren't surfaced with dedicated UI messages yet.

None of this is broken — it's just not built. Let me know which of these to tackle next and I'll continue from here.

---

## 6. API Documentation

See the endpoints below. All admin-only routes require `Authorization: Bearer <token>` from `/api/auth/login`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | `{ email, password }` → `{ token, admin }` |
| GET | `/api/auth/profile` | Admin | Get logged-in admin profile |
| PUT | `/api/auth/profile` | Admin | Update name / change password |

### Categories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | Public | List all categories |
| GET | `/api/categories/:slug` | Public | Get one category |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category (blocked if products reference it) |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List with query params: `search, category, minPrice, maxPrice, purity, availability, featured, bestSelling, sortBy, page, limit` |
| GET | `/api/products/:slug` | Public | Product details + images + similar products |
| POST | `/api/products` | Admin | Create (multipart form, field `images[]`, up to 8) |
| PUT | `/api/products/:id` | Admin | Update (multipart form, adds any new `images[]`) |
| DELETE | `/api/products/:id` | Admin | Delete product + its images |
| DELETE | `/api/products/images/:imageId` | Admin | Delete a single image |

### Wishlist (device-token based, no customer login)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/wishlist/:deviceToken` | Public | Get wishlist for a device |
| POST | `/api/wishlist` | Public | `{ deviceToken, productId }` |
| DELETE | `/api/wishlist` | Public | `{ deviceToken, productId }` |

### Inquiries
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/inquiries` | Public | `{ customerName, mobileNumber, productId?, message? }` |
| GET | `/api/inquiries` | Admin | List, filter by `?status=`, paginated |
| PUT | `/api/inquiries/:id/status` | Admin | `{ status: 'Pending'|'Contacted'|'Closed' }` |

### Website Settings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/settings` | Public | Get current settings |
| PUT | `/api/settings` | Admin | Update (multipart form for `logo` file) |

### Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Admin | Stats + monthly inquiry counts + recent products |

---

## 7. Tech Stack

**Frontend:** React 18, React Router, Axios, Tailwind CSS, React Icons, React Hook Form, React Toastify, Framer Motion, Vite
**Backend:** Node.js, Express, JWT, Multer, bcryptjs, Helmet, Morgan, dotenv, CORS, mysql2
**Database:** MySQL 8+ / MariaDB 10.6+ (MySQL Workbench friendly)
