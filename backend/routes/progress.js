const express = require('express');
const router = express.Router();
const {
  enrollInTraining,
  updateModuleProgress,
  getMyProgress,
  getAllProgress,
} = require('../controllers/progressController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/me', protect, getMyProgress);
router.get('/all', protect, restrictTo('admin'), getAllProgress);
router.post('/enroll/:trainingId', protect, enrollInTraining);
router.put('/:trainingId/module/:moduleIndex', protect, updateModuleProgress);

module.exports = router;
