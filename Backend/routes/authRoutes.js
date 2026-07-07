const express = require('express');
const router = express.Router();
const { login, getProfile, updateProfile } = require('../controllers/authController');
const { protectAdmin } = require('../middleware/auth');

router.post('/login', login);
router.get('/profile', protectAdmin, getProfile);
router.put('/profile', protectAdmin, updateProfile);

module.exports = router;
