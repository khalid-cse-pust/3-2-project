const express = require('express');
const router = express.Router();
const { getDashboardStats, getAuditLogs } = require('../controllers/reportController');
const { protect, staff, admin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, staff, getDashboardStats);
router.get('/audit-logs', protect, admin, getAuditLogs);

module.exports = router;
