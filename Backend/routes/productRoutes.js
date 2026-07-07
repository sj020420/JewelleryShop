const express = require('express');
const router = express.Router();
const {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, deleteProductImage,
} = require('../controllers/productController');
const { protectAdmin } = require('../middleware/auth');
const { uploadProductImages } = require('../middleware/upload');

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protectAdmin, uploadProductImages.array('images', 8), createProduct);
router.put('/:id', protectAdmin, uploadProductImages.array('images', 8), updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);
router.delete('/images/:imageId', protectAdmin, deleteProductImage);

module.exports = router;
