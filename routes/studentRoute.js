const express = require("express");
const router = express.Router();
const {
  findRegistration,
  getExams,
  orderItem,
} = require("../controllers/studentController");
const { protect } = require("../middleware/auth");

router.route("/order/:productId").post(protect, orderItem);
router.route("/fetchRegistration/:examId").get(protect, findRegistration);
router.route("/fetchExams").get(protect, getExams);

module.exports = router;
