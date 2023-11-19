const Joi = require("joi");
const Item = require("../models/Items");
const Orders = require("../models/Orders");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const UserRole = require("../helpers/enums/UserRole");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");
const OrderStatus = require("../helpers/enums/Orderstatus");

exports.addItem = async (req, res, next) => {
  try {
    const { name, description, price, waitingTime } = req.body;

    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required(),
      waitingTime: Joi.number().required(),
    });

    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const { error } = schema.validate(req.body, options);

    if (error?.details) {
      return next(
        new ErrorResponse(
          error?.details[0]?.message || "Bad Request",
          400,
          "ValidationError"
        )
      );
    }

    const user = await User.findOne({ _id: req.user.id });
    if (user?.userType !== UserRole.Staff) {
      return next(
        new ErrorResponse("Items Can be added only by Hotel Staff", 401)
      );
    }

    const itemDetails = await Item.create({
      name,
      userId: req.user.id,
      description,
      price,
      waitingTime,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    });
    res.status(201).json({
      success: true,
      data: itemDetails,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { orderStatus } = req.body;

    const schema = Joi.object({
      orderStatus: Joi.string().required(),
    });

    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const { error } = schema.validate(req.body, options);

    if (error?.details) {
      return next(
        new ErrorResponse(
          error?.details[0]?.message || "Bad Request",
          400,
          "ValidationError"
        )
      );
    }

    const registration = await Orders.findOne({ _id: orderId });

    if (!registration) {
      return next(new ErrorResponse("Order not found", 404));
    }

    if (
      !Object.keys(OrderStatus).some((ele) => OrderStatus[ele] === orderStatus)
    ) {
      return next(
        new ErrorResponse(
          `Orderstatus should be one of the foll:- ${Object.keys(OrderStatus)}`,
          404
        )
      );
    }

    // const productDetails = await Item.findById(registration?.productId);

    await Orders.findByIdAndUpdate(
      orderId,
      {
        orderStatus,
        updated: new Date().toISOString(),
      },
      { useFindAndModify: false }
    );

    const currentOrderDetails = await Orders.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(orderId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
        },
      },
      {
        $project: {
          "userDetails.userType": 0,
          "userDetails.password": 0,
          "userDetails.created": 0,
          "userDetails.updated": 0,
          "userDetails.__v": 0,
          __v: 0,
        },
      },
    ]);
    console.log(currentOrderDetails[0]);
    try {
      await sendEmail({
        to: currentOrderDetails[0]?.userDetails?.email,
        subject: "Hotel Code ERA: You are order is updated",
        text: `Hi ${currentOrderDetails[0]?.userDetails?.firstName} ${currentOrderDetails[0]?.userDetails?.lastName}, <div>You order status is updated to ${orderStatus}</div>`,
      });
    } catch (err) {
      console.log("send mail error", err);
    }

    res.status(201).json({
      success: true,
      data: currentOrderDetails?.length ? currentOrderDetails[0] : {},
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStockStatus = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const { stockStatus } = req.body;

    const schema = Joi.object({
      stockStatus: Joi.boolean().required(),
    });

    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const { error } = schema.validate(req.body, options);

    if (error?.details) {
      return next(
        new ErrorResponse(
          error?.details[0]?.message || "Bad Request",
          400,
          "ValidationError"
        )
      );
    }

    const registration = await Item.findOne({ _id: productId });

    if (!registration) {
      return next(new ErrorResponse("Order not found", 404));
    }

    await Item.findByIdAndUpdate(
      productId,
      {
        outOfStock: stockStatus,
        updated: new Date().toISOString(),
      },
      { useFindAndModify: false }
    );

    res.status(201).json({
      success: true,
      data: "Stock Status Updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUserProducts = async (req, res, next) => {
  try {
    const userDetails = req.user;
    const items = await Item.aggregate([
      {
        $match: {
          userId: userDetails._id,
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

exports.getAllOrders = async (req, res, next) => {
  try {
    const userDetails = req.user;
    const userId = userDetails._id;
    const currentRegistrations = await Item.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "productId",
          as: "orders",
        },
      },
      {
        $project: {
          "orders.__v": 0,
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
