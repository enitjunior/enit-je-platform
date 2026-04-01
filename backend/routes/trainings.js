const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
  uploadFile,
} = require('../controllers/trainingController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getAllTrainings);
router.get('/:id', protect, getTraining);
router.post('/', protect, restrictTo('admin'), createTraining);
router.put('/:id', protect, restrictTo('admin'), updateTraining);
router.delete('/:id', protect, restrictTo('admin'), deleteTraining);

// ✅ NOUVELLE ROUTE — upload vidéo ou PDF
router.post(
  '/:id/upload',
  protect,
  restrictTo('admin'),
  upload.single('file'),
  uploadFile
);

module.exports = router;