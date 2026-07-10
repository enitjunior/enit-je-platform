const express = require('express');
const router = express.Router();
const {
  enrollInTraining,
  updateModuleProgress,
  getMyProgress,
  getAllProgress,
} = require('../controllers/progressController');
const { protect, restrictTo } = require('../middleware/auth');

console.log('protect:', typeof protect);
console.log('restrictTo:', typeof restrictTo);
console.log('getMyProgress:', typeof getMyProgress);
console.log('getAllProgress:', typeof getAllProgress);
console.log('enrollInTraining:', typeof enrollInTraining);
console.log('updateModuleProgress:', typeof updateModuleProgress);

router.get('/me', protect, getMyProgress);
router.get('/all', protect, restrictTo('admin'), getAllProgress);
router.post('/enroll/:trainingId', protect, enrollInTraining);
router.put('/:trainingId/module/:moduleIndex', protect, updateModuleProgress);

module.exports = router;