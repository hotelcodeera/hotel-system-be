const express = require("express");
const router = express.Router();
const {
  findRegistration,
  getExams,
  orderItem,
  getAllUserOrders,
  getProducts,
} = require("../controllers/studentController");
const { protect } = require("../middleware/auth");

router.route("/order/:productId").post(protect, orderItem);
router.route("/fetchRegistration/:examId").get(protect, findRegistration);
router.route("/fetchExams").get(protect, getExams);
router.route("/getAllUsersOrders").get(protect, getAllUserOrders);
router.route("/getProducts").get(protect, getProducts);

module.exports = router;
