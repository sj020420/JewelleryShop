const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/dashboardController');
const { protectAdmin } = require('../middleware/auth');

router.get('/summary', protectAdmin, getSummary);

module.exports = router;
