const express = require('express');
const router = express.Router();
const {
  addProblem,
  getProblems,
  updateProblem,
} = require('../controllers/problemController');
const { protect, staff } = require('../middleware/authMiddleware');

router.route('/').post(protect, addProblem).get(protect, getProblems);
router.route('/:id').put(protect, staff, updateProblem);

module.exports = router;
