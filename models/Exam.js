const mongoose = require('mongoose');

// export interface Exam {
//     _id: string;
//     name: string;
//     description: string;
//     userId: string;
//     created?: string;
//     updated?: string;
//   }

const ExamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please exam name'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User Id is mandatory'],
  },
  description: {
    type: String,
  },
  created: { type: String },
  updated: { type: String, required: false, default: new Date().toISOString() },
});

const Exam = mongoose.model('Exam', ExamSchema);

module.exports = Exam;
