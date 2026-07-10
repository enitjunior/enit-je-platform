const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Training',
      required: true,
    },
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed'],
      default: 'enrolled',
    },
    completedModules: [
      {
        moduleIndex: Number,
        completedAt: { type: Date, default: Date.now },
      },
    ],
    percentageComplete: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, training: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);