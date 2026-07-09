require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { testConnection } = require('./config/db');
const { seedAdmin } = require('./utils/seedAdmin');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// ============================
// Middleware
// ============================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// Static Files
// ============================

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fallback for missing uploads (e.g. on ephemeral filesystems)
app.use('/uploads', (req, res, next) => {
  console.warn(`[Warning] Image file is missing: ${req.originalUrl}`);

  // Return a 1x1 transparent PNG placeholder with 200 OK
  const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const buffer = Buffer.from(placeholderBase64, 'base64');

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': buffer.length
  });
  res.end(buffer);
});

// ============================
// Health Check
// ============================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Saj by Anita Jewellery Backend Running 🚀',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
  });
});

// ============================
// API Routes
// ============================

// Authentication
app.use('/api/auth', authRoutes);

// Backward compatibility
// Old frontend using /api/admin/login will also work
app.use('/api/admin', authRoutes);

// Products
app.use('/api/products', productRoutes);

// Categories
app.use('/api/categories', categoryRoutes);

// Wishlist
app.use('/api/wishlist', wishlistRoutes);

// Inquiry
app.use('/api/inquiries', inquiryRoutes);

// Settings
app.use('/api/settings', settingsRoutes);

// Dashboard
app.use('/api/dashboard', dashboardRoutes);

// ============================
// Error Handling
// ============================

app.use(notFound);
app.use(errorHandler);

// ============================
// Server
// ============================

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await testConnection();
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Saj by Anita Jewellery API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server');
    console.error(error);
    process.exit(1);
  }
}

start();