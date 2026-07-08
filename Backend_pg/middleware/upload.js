const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeStorage(subfolder) {
  const dir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase());
  if (isValid) cb(null, true);
  else cb(new Error('Only .jpeg, .jpg, .png, .webp images are allowed'));
};

const maxSize = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5) * 1024 * 1024;

const uploadProductImages = multer({
  storage: makeStorage('products'),
  fileFilter,
  limits: { fileSize: maxSize },
});

const uploadBannerImage = multer({
  storage: makeStorage('banners'),
  fileFilter,
  limits: { fileSize: maxSize },
});

const uploadLogo = multer({
  storage: makeStorage('settings'),
  fileFilter,
  limits: { fileSize: maxSize },
});

module.exports = { uploadProductImages, uploadBannerImage, uploadLogo };
