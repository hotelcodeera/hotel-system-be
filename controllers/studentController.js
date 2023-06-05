const Joi = require("joi");
const Exam = require("../models/Exam");
const Item = require("../models/Items");
const Orders = require("../models/Orders");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const StudentRegistration = require("../models/StudentRegistration");
const OrderStatus = require("../helpers/enums/Orderstatus");
const mongoose = require("mongoose");

exports.registerForExam = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const examId = req.params.examId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const existinParticipation = await StudentRegistration.findOne({
      userId,
      examId,
    });

    if (existinParticipation) {
      return next(
        new ErrorResponse("Already registered for the exam", 400, "Bad Request")
      );
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return next(new ErrorResponse("Exam Not found", 404, "Not found"));
    }

    const userRegistrationDetails = await StudentRegistration.create({
      examId,
      userId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      studentGrades: [],
    });

    res.status(201).json({
      success: true,
      data: {
        updated: userRegistrationDetails.updated,
        _id: userRegistrationDetails._id,
        userId,
        examId,
        created: userRegistrationDetails.created,
        studentGrades: [],
        name: exam.name,
        description: exam.description,
        isNotRegistered: false,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.orderItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;
    const { quantity } = req.body;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const exam = await Item.findById(productId);
    if (!exam) {
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
    const exams = await Item.aggregate([
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
      data: exams,
    });
  } catch (err) {
    next(err);
  }
};

exports.findRegistration = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const examId = req.params.examId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return next(new ErrorResponse("Exam Not found", 404, "Not found"));
    }

    const existinParticipation = await StudentRegistration.findOne({
      userId,
      examId,
    });

    res.status(200).json({
      success: true,
      data: {
        updated: existinParticipation?.updated,
        _id: existinParticipation?._id || "",
        userId,
        examId,
        created: existinParticipation?.created,
        studentGrades: existinParticipation?.studentGrades || [],
        name: exam.name,
        description: exam.description,
        isNotRegistered: !existinParticipation?._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getExams = async (req, res, next) => {
  try {
    const exams = await Exam.aggregate([
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
      data: exams,
    });
  } catch (err) {
    next(err);
  }
};
