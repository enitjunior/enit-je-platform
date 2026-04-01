const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUserRole,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, restrictTo('admin'), getAllUsers);
router.get('/:id', protect, restrictTo('admin'), getUserById);
router.put('/:id/toggle-status', protect, restrictTo('admin'), toggleUserStatus);
router.put('/:id/role', protect, restrictTo('admin'), updateUserRole);

module.exports = router;
