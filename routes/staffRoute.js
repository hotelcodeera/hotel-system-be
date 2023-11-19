const express = require("express");
const router = express.Router();
const {
  addItem,
  updateOrderStatus,
  getCurrentUserProducts,
  updateStockStatus,
  getAllOrders,
} = require("../controllers/staffController");
const { staffProtect } = require("../middleware/auth");

router.route("/addItem").post(staffProtect, addItem);
router.route("/getProducts").get(staffProtect, getCurrentUserProducts);
router.route("/getAllOrders").get(staffProtect, getAllOrders);
router
  .route("/updateOrderStatus/:orderId")
  .post(staffProtect, updateOrderStatus);
router
  .route("/updateStockStatus/:productId")
  .post(staffProtect, updateStockStatus);

module.exports = router;
