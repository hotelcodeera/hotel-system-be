// export interface StudentGrades {
//     subject: string;
//     grade: number;
//   }
  
//   export interface StudentRegistration {
//     _id: string;
//     userId: string;
//     examId: string;
//     created?: string;
//     updated?: string;
//     studentGrades?: StudentGrades[];
//   }

const mongoose = require('mongoose');

const studentGrades = new mongoose.Schema(
    {
        subject: {
        type: String,
      },
      grade: {
        type: Number,
      }
    },
  );

const StudentRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User Id is mandatory'],
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Exam Id is mandatory'],
  },
  studentGrades: [studentGrades],
  created: {type: String},
  updated: {type: String, required: false, default: new Date().toISOString()},
});

const StudentRegistration = mongoose.model('StudentRegistration', StudentRegistrationSchema);

module.exports = StudentRegistration;
