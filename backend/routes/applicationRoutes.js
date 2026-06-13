const express = require('express');
const router = express.Router();
const {
  addApplication,
  getApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addApplication).get(protect, getApplications);
router.route('/:id').put(protect, admin, updateApplicationStatus);

module.exports = router;
