const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  authUser,
  registerUser,
  getPendingUsers,
  getApprovedUsers,
  approveUser,
  rejectUser,
  getUserProfile,
  getStudentById,
} = require('../controllers/userController');
const { protect, staff } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/', registerUser);
router.post('/login', authUser);

router.get('/profile', protect, getUserProfile);
router.get('/search/:studentId', protect, getStudentById);

router.get('/pending', protect, staff, getPendingUsers);
router.get('/approved-list', protect, staff, getApprovedUsers);
router.put('/:id/approve', protect, staff, approveUser);
router.put('/:id/reject', protect, staff, rejectUser);

module.exports = router;
