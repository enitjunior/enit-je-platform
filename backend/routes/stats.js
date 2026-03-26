const express = require('express');
const router = express.Router();
const { getAdminStats, getMemberStats } = require('../controllers/statsController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/admin', protect, restrictTo('admin'), getAdminStats);
router.get('/me', protect, getMemberStats);

module.exports = router;
