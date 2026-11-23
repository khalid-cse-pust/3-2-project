const express = require('express');
const router = express.Router();
const {
  addApplication,
  getApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, staff } = require('../middleware/authMiddleware');

router.route('/').post(protect, addApplication).get(protect, getApplications);
router.route('/:id').put(protect, staff, updateApplicationStatus);

module.exports = router;
