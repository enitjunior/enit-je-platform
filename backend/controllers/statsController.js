const User = require('../models/User');
const Training = require('../models/Training');
const Progress = require('../models/Progress');
const TrainingProposal = require('../models/TrainingProposal');

/**
 * @desc    Admin dashboard statistics
 * @route   GET /api/stats/admin
 * @access  Private/Admin
 */
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalTrainings, totalProposals, allProgress] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      Training.countDocuments({ isPublished: true }),
      TrainingProposal.countDocuments(),
      Progress.find().populate('training', 'category'),
    ]);

    const completedCount = allProgress.filter((p) => p.status === 'completed').length;
    const inProgressCount = allProgress.filter((p) => p.status === 'in_progress').length;
    const pendingProposals = await TrainingProposal.countDocuments({ status: 'pending' });

    // Enrollments per category
    const categoryMap = {};
    allProgress.forEach((p) => {
      if (p.training?.category) {
        categoryMap[p.training.category] = (categoryMap[p.training.category] || 0) + 1;
      }
    });

    // Monthly enrollments (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Progress.aggregate([
      { $match: { enrolledAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$enrolledAt' },
            month: { $month: '$enrolledAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTrainings,
        totalProposals,
        pendingProposals,
        completedTrainings: completedCount,
        inProgressTrainings: inProgressCount,
        totalEnrollments: allProgress.length,
        enrollmentsByCategory: categoryMap,
        monthlyEnrollments: monthlyData,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Member dashboard statistics
 * @route   GET /api/stats/me
 * @access  Private
 */
const getMemberStats = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id })
      .populate('training', 'title category level duration');

    const totalEnrolled = progress.length;
    const completed = progress.filter((p) => p.status === 'completed').length;
    const inProgress = progress.filter((p) => p.status === 'in_progress').length;
    const totalHours = progress
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (p.training?.duration || 0), 0);

    const categoryProgress = {};
    progress.forEach((p) => {
      if (p.training?.category) {
        if (!categoryProgress[p.training.category]) {
          categoryProgress[p.training.category] = { total: 0, completed: 0 };
        }
        categoryProgress[p.training.category].total++;
        if (p.status === 'completed') categoryProgress[p.training.category].completed++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalEnrolled,
        completed,
        inProgress,
        totalHoursLearned: totalHours,
        categoryProgress,
        recentActivity: progress.slice(0, 5),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAdminStats, getMemberStats };
