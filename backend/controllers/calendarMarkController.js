const CalendarMark = require('../models/CalendarMark');

const getAllMarks = async (req, res) => {
  try {
    const marks = await CalendarMark.find().sort('date');
    res.json({ success: true, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Crée un marquage, ou met à jour la couleur si le jour est déjà marqué
const createOrUpdateMark = async (req, res) => {
  try {
    const { date, color, label } = req.body;
    if (!date || !color) {
      return res.status(400).json({ success: false, message: 'Date et couleur requises.' });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000);

    const existing = await CalendarMark.findOne({
      date: { $gte: normalizedDate, $lt: nextDay },
    });

    let mark;
    if (existing) {
      existing.color = color;
      existing.label = label || '';
      mark = await existing.save();
    } else {
      mark = await CalendarMark.create({
        date: normalizedDate,
        color,
        label,
        createdBy: req.user._id,
      });
    }
    res.status(201).json({ success: true, mark });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMark = async (req, res) => {
  try {
    const mark = await CalendarMark.findByIdAndDelete(req.params.id);
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Marquage introuvable.' });
    }
    res.json({ success: true, message: 'Marquage supprimé.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllMarks, createOrUpdateMark, deleteMark };