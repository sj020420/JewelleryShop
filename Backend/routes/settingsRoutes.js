const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protectAdmin } = require('../middleware/auth');
const { uploadLogo } = require('../middleware/upload');

router.get('/', getSettings);
router.put('/', protectAdmin, uploadLogo.single('logo'), updateSettings);

module.exports = router;
