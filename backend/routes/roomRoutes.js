const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  getAllSeats,
  assignSeat,
  vacateSeat,
} = require('../controllers/roomController');
const { protect, staff, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRooms).post(protect, admin, createRoom);
router.get('/seats/all', protect, getAllSeats);
router.route('/:id').get(protect, getRoomById).put(protect, staff, updateRoom);
router.post('/seats/:id/assign', protect, staff, assignSeat);
router.post('/seats/:id/vacate', protect, staff, vacateSeat);

module.exports = router;
