/**
 * Seed script — run with: node scripts/seed.js
 * Creates an admin, sample members, trainings, and progress records.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const mongoose = require('mongoose');
const User = require('../models/User');
const Training = require('../models/Training');
const Progress = require('../models/Progress');
const TrainingProposal = require('../models/TrainingProposal');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enit_je_platform';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Training.deleteMany(),
    Progress.deleteMany(),
    TrainingProposal.deleteMany(),
  ]);
  console.log('Cleared existing data');

  // Create admin
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'ENIT JE',
    email: 'admin@enitje.tn',
    password: 'admin123',
    role: 'admin',
    department: 'RH',
  });

  // Create members
  const members = await User.create([
    { firstName: 'Amine', lastName: 'Trabelsi', email: 'amine@enitje.tn', password: 'member123', role: 'member', department: 'IT' },
    { firstName: 'Sarra', lastName: 'Ben Ali', email: 'sarra@enitje.tn', password: 'member123', role: 'member', department: 'Marketing' },
    { firstName: 'Mohamed', lastName: 'Chaabane', email: 'mohamed@enitje.tn', password: 'member123', role: 'member', department: 'Finance' },
  ]);
  console.log('Created users');

  // Create trainings
  const trainings = await Training.create([
    {
      title: 'Introduction to React.js',
      description: 'Learn the fundamentals of React including components, state, props, and hooks.',
      category: 'Technical',
      level: 'Beginner',
      duration: 10,
      instructor: 'Khalil Maaloul',
      tags: ['react', 'javascript', 'frontend'],
      modules: [
        { title: 'What is React?', description: 'Overview of React and its ecosystem', order: 1 },
        { title: 'Components & JSX', description: 'Building blocks of React apps', order: 2 },
        { title: 'State & Props', description: 'Managing data in React', order: 3 },
        { title: 'React Hooks', description: 'useState, useEffect and more', order: 4 },
      ],
      createdBy: admin._id,
      enrolledCount: 2,
    },
    {
      title: 'Project Management Essentials',
      description: 'Master agile methodologies, project planning, and team coordination.',
      category: 'Management',
      level: 'Intermediate',
      duration: 8,
      instructor: 'Nadia Sfar',
      tags: ['agile', 'scrum', 'management'],
      modules: [
        { title: 'Agile Fundamentals', description: 'Core principles of agile', order: 1 },
        { title: 'Scrum Framework', description: 'Sprints, ceremonies, and roles', order: 2 },
        { title: 'Project Planning', description: 'Roadmaps and timelines', order: 3 },
      ],
      createdBy: admin._id,
      enrolledCount: 1,
    },
    {
      title: 'UI/UX Design Principles',
      description: 'Learn user-centered design, wireframing, and prototyping with Figma.',
      category: 'Design',
      level: 'Beginner',
      duration: 6,
      instructor: 'Rim Jebali',
      tags: ['design', 'figma', 'ux'],
      modules: [
        { title: 'Design Thinking', description: 'Empathize, define, ideate', order: 1 },
        { title: 'Wireframing', description: 'Sketching and low-fi prototypes', order: 2 },
        { title: 'Figma Basics', description: 'Hands-on with Figma', order: 3 },
      ],
      createdBy: admin._id,
      enrolledCount: 1,
    },
    {
      title: 'Financial Analysis & Reporting',
      description: 'Understand financial statements, KPIs, and business reporting.',
      category: 'Finance',
      level: 'Intermediate',
      duration: 7,
      instructor: 'Tarek Marzouki',
      tags: ['finance', 'excel', 'reporting'],
      modules: [
        { title: 'Financial Statements', description: 'P&L, Balance Sheet, Cash Flow', order: 1 },
        { title: 'KPI Analysis', description: 'Defining and tracking KPIs', order: 2 },
      ],
      createdBy: admin._id,
      enrolledCount: 1,
    },
  ]);
  console.log('Created trainings');

  // Create progress records
  await Progress.create([
    {
      user: members[0]._id,
      training: trainings[0]._id,
      status: 'in_progress',
      completedModules: [{ moduleIndex: 0 }, { moduleIndex: 1 }],
      percentageComplete: 50,
    },
    {
      user: members[0]._id,
      training: trainings[1]._id,
      status: 'completed',
      completedModules: [{ moduleIndex: 0 }, { moduleIndex: 1 }, { moduleIndex: 2 }],
      percentageComplete: 100,
      completedAt: new Date(),
    },
    {
      user: members[1]._id,
      training: trainings[2]._id,
      status: 'enrolled',
      completedModules: [],
      percentageComplete: 0,
    },
    {
      user: members[2]._id,
      training: trainings[3]._id,
      status: 'in_progress',
      completedModules: [{ moduleIndex: 0 }],
      percentageComplete: 50,
    },
  ]);
  console.log('Created progress records');

  // Create proposals
  await TrainingProposal.create([
    {
      title: 'Advanced Node.js & Microservices',
      description: 'Deep dive into Node.js architecture and microservices patterns.',
      category: 'Technical',
      justification: 'Our backend projects need better architecture patterns.',
      suggestedDuration: 12,
      submittedBy: members[0]._id,
      status: 'pending',
    },
    {
      title: 'Digital Marketing & SEO',
      description: 'Learn SEO, content marketing, and social media strategy.',
      category: 'Marketing',
      justification: 'Enhance our online presence and outreach capabilities.',
      suggestedDuration: 6,
      submittedBy: members[1]._id,
      status: 'approved',
      reviewedBy: admin._id,
      reviewNote: 'Great idea, will be added next quarter.',
      reviewedAt: new Date(),
    },
  ]);
  console.log('Created proposals');

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────');
  console.log('Admin:  admin@enitje.tn  / admin123');
  console.log('Member: amine@enitje.tn  / member123');
  console.log('─────────────────────────────────');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
