const TrainingProposal = require('../models/TrainingProposal');

/**
 * @desc    Submit a training proposal
 * @route   POST /api/proposals
 * @access  Private
 */
const createProposal = async (req, res) => {
  try {
    const { title, description, category, justification, expectedBenefits, suggestedDuration } =
      req.body;

    const proposal = await TrainingProposal.create({
      title,
      description,
      category,
      justification,
      expectedBenefits,
      suggestedDuration,
      submittedBy: req.user._id,
    });

    res.status(201).json({ success: true, proposal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get all proposals (Admin)
 * @route   GET /api/proposals
 * @access  Private/Admin
 */
const getAllProposals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const proposals = await TrainingProposal.find(filter)
      .populate('submittedBy', 'firstName lastName email department')
      .populate('reviewedBy', 'firstName lastName')
      .sort('-createdAt');

    res.json({ success: true, count: proposals.length, proposals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get my proposals
 * @route   GET /api/proposals/me
 * @access  Private
 */
const getMyProposals = async (req, res) => {
  try {
    const proposals = await TrainingProposal.find({ submittedBy: req.user._id })
      .sort('-createdAt');

    res.json({ success: true, count: proposals.length, proposals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Review a proposal (approve/reject) - Admin only
 * @route   PUT /api/proposals/:id/review
 * @access  Private/Admin
 */
const reviewProposal = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const proposal = await TrainingProposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    proposal.status = status;
    proposal.reviewedBy = req.user._id;
    proposal.reviewNote = reviewNote;
    proposal.reviewedAt = new Date();

    await proposal.save();

    res.json({ success: true, proposal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createProposal, getAllProposals, getMyProposals, reviewProposal };
