const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  getStudentById,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.get('/search/:studentId', protect, getStudentById);

module.exports = router;
