const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
} = require('../controllers/trainingController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, getAllTrainings);
router.get('/:id', protect, getTraining);
router.post('/', protect, restrictTo('admin'), createTraining);
router.put('/:id', protect, restrictTo('admin'), updateTraining);
router.delete('/:id', protect, restrictTo('admin'), deleteTraining);

module.exports = router;
