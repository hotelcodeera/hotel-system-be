const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User Id is mandatory"],
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "ProductID is mandatory"],
  },
  quantity: {
    type: Number,
    required: [true, "Please enter Quantity"],
  },
  orderStatus: {
    type: String,
    enum: ["PENDING", "INPROGRESS", "READY"],
    default: "PENDING",
  },
  created: { type: String },
  updated: { type: String, required: false, default: new Date().toISOString() },
});

const Orders = mongoose.model("Orders", OrderSchema);

module.exports = Orders;
