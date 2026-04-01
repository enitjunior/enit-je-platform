const express = require('express');
const router = express.Router();
const {
  createProposal,
  getAllProposals,
  getMyProposals,
  reviewProposal,
} = require('../controllers/proposalController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, createProposal);
router.get('/', protect, restrictTo('admin'), getAllProposals);
router.get('/me', protect, getMyProposals);
router.put('/:id/review', protect, restrictTo('admin'), reviewProposal);

module.exports = router;
