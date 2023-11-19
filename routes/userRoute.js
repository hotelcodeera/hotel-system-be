const express = require("express");
const router = express.Router();
const {
  orderItem,
  getAllUserOrders,
  getProducts,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.route("/order/:productId").post(protect, orderItem);
router.route("/getAllUsersOrders").get(protect, getAllUserOrders);
router.route("/getProducts").get(protect, getProducts);

module.exports = router;
