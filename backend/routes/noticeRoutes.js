const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, staff, admin } = require('../middleware/authMiddleware');

router.route('/').get(getNotices).post(protect, staff, createNotice);
router.route('/:id').put(protect, staff, updateNotice).delete(protect, admin, deleteNotice);

module.exports = router;
