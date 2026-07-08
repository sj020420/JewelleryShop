const express = require('express');
const router = express.Router();
const { createInquiry, getInquiries, updateInquiryStatus } = require('../controllers/inquiryController');
const { protectAdmin } = require('../middleware/auth');

router.post('/', createInquiry);
router.get('/', protectAdmin, getInquiries);
router.put('/:id/status', protectAdmin, updateInquiryStatus);

module.exports = router;
