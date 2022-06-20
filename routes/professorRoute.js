const express = require('express');
const router = express.Router();
const {
  addExam,
  getCurrentUserExam,
  registerForExam,
  getUnRegisteredUsers,
  getAllRegistrations,
  gradeStudent,
  removeRegistration
} = require('../controllers/professorController');
const { professorProtect } = require('../middleware/auth');

router.route('/addExam').post(professorProtect, addExam);
router.route('/getExams').get(professorProtect, getCurrentUserExam);
router.route('/register').post(professorProtect, registerForExam);
router.route('/fetchUnRegisterStudents/:examId').get(professorProtect, getUnRegisteredUsers);
router.route('/fetchRegistrations/:examId').get(professorProtect, getAllRegistrations);
router.route('/gradeStudent/:requestId').post(professorProtect, gradeStudent);
router.route('/removeRegistration/:requestId').post(professorProtect, removeRegistration);
// router.route('/getLeagueById/:leagueId').get(leagueAdminProtect, getLeagueById);
// router.route('/addQuestion').post(leagueAdminProtect, addQuestion);
// router.route('/getQuestionsByLeague/:leagueId').get(leagueAdminProtect, getQuestionByLeague);
// router.route('/updateAnswer').post(leagueAdminProtect, updateAnswers);
// router.route('/startLeague').post(leagueAdminProtect, startLeague);
// router.route('/stopLeague').post(leagueAdminProtect, stopLeague);
// router.route('/getParticipationsByLeagueId/:leagueId').get(leagueAdminProtect, getParticipationsByLeagueId);
// router.route('/getLeaderBoardByLeagueId/:leagueId').get(leagueAdminProtect, getLeaderBoardByLeagueId);
// router.route('/getLeagueStats/:leagueId').get(leagueAdminProtect, getLeagueStats);
// router.route('/createPost/:leagueId').post(leagueAdminProtect, createPost);
// router.route('/getPostsByLeagueId/:leagueId').get(leagueAdminProtect, getPostsByLeagueId);
//API to calculate user specific selceted answers

module.exports = router;
