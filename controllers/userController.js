const Joi = require("joi");
const Item = require("../models/Items");
const Orders = require("../models/Orders");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const OrderStatus = require("../helpers/enums/Orderstatus");
const mongoose = require("mongoose");
exports.orderItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (!Number(quantity) || Number(quantity) < 0) {
      return next(
        new ErrorResponse("Quantity should be greater than zero", 400)
      );
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const items = await Item.findById(productId);
    if (!items) {
      return next(new ErrorResponse("Item Not found", 404, "Not found"));
    }

    const userRegistrationDetails = await Orders.create({
      productId,
      userId,
      quantity,
      orderStatus: OrderStatus.Pending,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: {
        updated: userRegistrationDetails.updated,
        _id: userRegistrationDetails._id,
        userId,
        productId,
        quantity,
        created: userRegistrationDetails.created,
        orderStatus: OrderStatus.Pending,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUserOrders = async (req, res, next) => {
  try {
    const userDetails = req.user;
    const userId = userDetails._id;
    const currentRegistrations = await Orders.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          created: -1,
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails",
        },
      },
      {
        $project: {
          "productDetails.__v": 0,
          __v: 0,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: currentRegistrations,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const items = await Item.aggregate([
      {
        $match: {
          outOfStock: false,
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
      {
        $sort: {
          created: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};
