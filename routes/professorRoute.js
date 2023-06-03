const express = require("express");
const router = express.Router();
const {
  addExam,
  getCurrentUserExam,
  registerForExam,
  getUnRegisteredUsers,
  getAllRegistrations,
  gradeStudent,
  removeRegistration,
  addItem,
  updateOrderStatus,
  getCurrentUserProducts,
  updateStockStatus,
  getAllOrders,
} = require("../controllers/professorController");
const { professorProtect } = require("../middleware/auth");

router.route("/addExam").post(professorProtect, addExam);
router.route("/addItem").post(professorProtect, addItem);
router.route("/getExams").get(professorProtect, getCurrentUserExam);
router.route("/getProducts").get(professorProtect, getCurrentUserProducts);
router.route("/getAllOrders").get(professorProtect, getAllOrders);
router.route("/register").post(professorProtect, registerForExam);
router
  .route("/fetchUnRegisterStudents/:examId")
  .get(professorProtect, getUnRegisteredUsers);
router
  .route("/fetchRegistrations/:examId")
  .get(professorProtect, getAllRegistrations);
router.route("/gradeStudent/:requestId").post(professorProtect, gradeStudent);
router
  .route("/updateOrderStatus/:orderId")
  .post(professorProtect, updateOrderStatus);
router
  .route("/updateStockStatus/:productId")
  .post(professorProtect, updateStockStatus);
router
  .route("/removeRegistration/:requestId")
  .post(professorProtect, removeRegistration);
//API to calculate user specific selceted answers

module.exports = router;
