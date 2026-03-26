const mongoose = require('mongoose');

const trainingProposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Proposal title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Technical', 'Management', 'Design', 'Marketing', 'Finance', 'Soft Skills', 'Other'],
    },
    justification: {
      type: String,
      required: [true, 'Justification is required'],
    },
    expectedBenefits: {
      type: String,
    },
    suggestedDuration: {
      type: Number, // in hours
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNote: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainingProposal', trainingProposalSchema);
