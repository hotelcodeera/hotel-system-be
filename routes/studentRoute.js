const express = require('express');
const router = express.Router();
const {
  registerForExam,
  findRegistration,
  getExams
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');


router.route('/register/:examId').post(protect, registerForExam);
router.route('/fetchRegistration/:examId').get(protect, findRegistration);
router.route('/fetchExams').get(protect, getExams);

module.exports = router;
