const express = require('express');
const router = express.Router();
const {
  getAllMarks,
  createOrUpdateMark,
  deleteMark,
} = require('../controllers/calendarMarkController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, getAllMarks);
router.post('/', protect, restrictTo('admin'), createOrUpdateMark);
router.delete('/:id', protect, restrictTo('admin'), deleteMark);

module.exports = router;