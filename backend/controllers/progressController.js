const Progress = require('../models/Progress');
const Training = require('../models/Training');

/**
 * @desc    Enroll current user in a training
 * @route   POST /api/progress/enroll/:trainingId
 * @access  Private
 */
const enrollInTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.trainingId);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found.' });
    }

    // Check if already enrolled
    const existing = await Progress.findOne({
      user: req.user._id,
      training: req.params.trainingId,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this training.' });
    }

    const progress = await Progress.create({
      user: req.user._id,
      training: req.params.trainingId,
      status: 'enrolled',
    });

    // Increment enrolled count
    await Training.findByIdAndUpdate(req.params.trainingId, {
      $inc: { enrolledCount: 1 },
    });

    res.status(201).json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update progress for a training module
 * @route   PUT /api/progress/:trainingId/module/:moduleIndex
 * @access  Private
 */
const updateModuleProgress = async (req, res) => {
  try {
    const { trainingId, moduleIndex } = req.params;

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found.' });
    }

    const progress = await Progress.findOne({
      user: req.user._id,
      training: trainingId,
    });

    if (!progress) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this training.' });
    }

    // Add module if not already completed
    const alreadyDone = progress.completedModules.find(
      (m) => m.moduleIndex === parseInt(moduleIndex)
    );

    if (!alreadyDone) {
      progress.completedModules.push({ moduleIndex: parseInt(moduleIndex) });
    }

    // Recalculate percentage
    const totalModules = training.modules.length || 1;
    progress.percentageComplete = Math.round(
      (progress.completedModules.length / totalModules) * 100
    );

    // Update status
    if (progress.percentageComplete === 0) {
      progress.status = 'enrolled';
    } else if (progress.percentageComplete === 100) {
      progress.status = 'completed';
      progress.completedAt = new Date();
      await Training.findByIdAndUpdate(trainingId, { $inc: { completedCount: 1 } });
    } else {
      progress.status = 'in_progress';
    }

    await progress.save();
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get my progress (all trainings)
 * @route   GET /api/progress/me
 * @access  Private
 */
const getMyProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({ user: req.user._id })
      .populate('training', 'title category level duration thumbnail')
      .sort('-updatedAt');

    res.json({ success: true, count: progressList.length, progress: progressList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get all members' progress (Admin)
 * @route   GET /api/progress/all
 * @access  Private/Admin
 */
const getAllProgress = async (req, res) => {
  try {
    const { userId, trainingId } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (trainingId) filter.training = trainingId;

    const progressList = await Progress.find(filter)
      .populate('user', 'firstName lastName email department')
      .populate('training', 'title category')
      .sort('-updatedAt');

    res.json({ success: true, count: progressList.length, progress: progressList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  enrollInTraining,
  updateModuleProgress,
  getMyProgress,
  getAllProgress,
};
