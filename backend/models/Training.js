const mongoose = require('mongoose');
const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
  enum: ['Marketing', 'DevCo', 'Projet', 'Affaires Internationales', 'Qualité', 'IT', 'Toutes les cellules'],
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 0,
    },
    instructor: { type: String, trim: true },
    color: { type: String, default: '#28374d' },  
    scheduledDate: {
  type: Date,
  default: null,
},

tags: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    modules: [
      {
        title: { type: String, required: true },
        description: String,
        order: { type: Number, required: true },
        resources: [
          {
            type: { type: String, enum: ['video', 'pdf', 'link', 'quiz'] },
            title: String,
            url: String,
          },
        ],
      },
    ],
    enrolledCount: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    thumbnail: { type: String, default: '' },

    // Les champs suivants sont pour les fichiers uploadés (vidéos, PDFs)
    videoUrl: { type: String, default: '' },
    videoLink: { type: String, default: '' },
    pdfUrl:   { type: String, default: '' },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Training', trainingSchema);