const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.get('/:deviceToken', getWishlist);
router.post('/', addToWishlist);
router.delete('/', removeFromWishlist);

module.exports = router;
