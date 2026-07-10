const Training = require('../models/Training');
const Progress = require('../models/Progress');

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

const getTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id).populate(
      'createdBy', 'firstName lastName'
    );
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found.' });
    }
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

const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found.' });
    }
    await Progress.deleteMany({ training: req.params.id });
    res.json({ success: true, message: 'Training deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ NOUVELLE FONCTION
const uploadFile = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found.' });
    }
    const fileUrl = `http://localhost:5000/uploads/${req.file?.filename}`;
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const fileType = req.query.type;
    if (fileType === 'video') {
      training.videoUrl = fileUrl;
    } else if (fileType === 'pdf') {
      training.pdfUrl = fileUrl;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type. Use ?type=video or ?type=pdf' });
    }
    await training.save();
    res.json({ success: true, training });
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
  uploadFile,
};