const { number } = require("joi");
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter item name"],
  },
  description: {
    type: String,
    required: [true, "Please enter description"],
  },
  price: {
    type: Number,
    required: [true, "Please enter price"],
  },
  outOfStock: {
    type: Boolean,
    default: false,
  },
  waitingTime: {
    type: Number,
    required: [true, "Please enter waiting name"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User Id is mandatory"],
  },
  created: { type: String },
  updated: { type: String, required: false, default: new Date().toISOString() },
});

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
