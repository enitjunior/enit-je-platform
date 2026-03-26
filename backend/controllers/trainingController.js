const Training = require('../models/Training');
const Progress = require('../models/Progress');

/**
 * @desc    Get all published trainings
 * @route   GET /api/trainings
 * @access  Private
 */
const getAllTrainings = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const trainings = await Training.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort('-createdAt');

    res.json({ success: true, count: trainings.length, trainings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get single training by ID
 * @route   GET /api/trainings/:id
 * @access  Private
 */
const getTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id).populate(
      'createdBy',
      'firstName lastName'
    );

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found.' });
    }

    // Check if current user is enrolled
    let userProgress = null;
    if (req.user) {
      userProgress = await Progress.findOne({
        user: req.user._id,
        training: training._id,
      });
    }

    res.json({ success: true, training, userProgress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Create a training (Admin only)
 * @route   POST /api/trainings
 * @access  Private/Admin
 */
const createTraining = async (req, res) => {
  try {
    const training = await Training.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, training });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update a training (Admin only)
 * @route   PUT /api/trainings/:id
 * @access  Private/Admin
 */
const updateTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found.' });
    }

    res.json({ success: true, training });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete a training (Admin only)
 * @route   DELETE /api/trainings/:id
 * @access  Private/Admin
 */
const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found.' });
    }

    // Also delete all progress records for this training
    await Progress.deleteMany({ training: req.params.id });

    res.json({ success: true, message: 'Training deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
};
