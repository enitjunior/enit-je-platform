const mongoose = require('mongoose');

const calendarMarkSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      default: '#3ec0c7',
    },
    label: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CalendarMark', calendarMarkSchema);