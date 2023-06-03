const Joi = require("joi");
const Exam = require("../models/Exam");
const Item = require("../models/Items");
const Orders = require("../models/Orders");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const UserRole = require("../helpers/enums/UserRole");
const sendEmail = require("../utils/sendEmail");
const StudentRegistration = require("../models/StudentRegistration");
const mongoose = require("mongoose");
const OrderStatus = require("../helpers/enums/Orderstatus");

exports.addExam = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
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
        new ErrorResponse("Exam Can be added only by Professor", 401)
      );
    }

    const examDetails = await Exam.create({
      name,
      userId: req.user.id,
      description,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    });

    const message = `
      <h1>${name} has been successfully created.Please grade for students after registration</h1>
    `;
    try {
      await sendEmail({
        to: user?.email,
        subject: "GRADING SYSTEM: Exam created Successfully",
        text: message,
      });
    } catch (err) {
      console.log(err);
    }
    res.status(201).json({
      success: true,
      data: examDetails,
    });
  } catch (err) {
    next(err);
  }
};

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
    try {
      await sendEmail({
        to: currentOrderDetails[0]?.userDetails?.email,
        subject: "Hote Code ERA: You are order is updated",
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

exports.getCurrentUserExam = async (req, res, next) => {
  try {
    const userDetails = req.user;
    const exams = await Exam.aggregate([
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
      data: exams,
    });
  } catch (err) {
    next(err);
  }
};

exports.registerForExam = async (req, res, next) => {
  try {
    const { userId, examId } = req.body;

    const schema = Joi.object({
      userId: Joi.string().required(),
      examId: Joi.string().required(),
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

    const league = await Exam.findById(examId);

    if (!league) {
      return next(new ErrorResponse("Exam Not found", 404, "Not found"));
    }

    const userRegistrationDetails = await StudentRegistration.create({
      examId,
      userId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      studentGrades: [],
    });

    try {
      await sendEmail({
        to: user?.email,
        subject: "GRADING SYSTEM: You are registered for the exam",
        text: `Hi ${user?.firstName} ${user?.lastName}, <div>You are registered successfully for ${league?.name}</div>`,
      });
    } catch (err) {
      console.log("send mail error", err);
    }

    res.status(201).json({
      success: true,
      data: {
        _id: userRegistrationDetails._id,
        userId,
        userName: user.username,
        examId,
        created: userRegistrationDetails.created,
        updated: userRegistrationDetails.updated,
        studentGrades: [],
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUnRegisteredUsers = async (req, res, next) => {
  try {
    const examId = req.params.examId;

    const currentRegistrations = await StudentRegistration.find({ examId });
    const registeredUsers =
      currentRegistrations?.map((ele) => ele.userId.toString()) || [];
    let currentUsers = await User.find({ userType: UserRole.User });
    currentUsers = currentUsers?.filter(
      (ele) => !registeredUsers.includes(ele._id.toString())
    );
    res.status(200).json({
      success: true,
      data: currentUsers?.length
        ? currentUsers.map((ele) => {
            return { userName: ele.username, userId: ele._id };
          })
        : [],
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllRegistrations = async (req, res, next) => {
  try {
    const examId = req.params.examId;
    const currentRegistrations = await StudentRegistration.aggregate([
      {
        $match: {
          examId: mongoose.Types.ObjectId(examId),
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
          "userDetails.email": 0,
          "userDetails.__v": 0,
          userId: 0,
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

exports.gradeStudent = async (req, res, next) => {
  try {
    const requestId = req.params.requestId;
    const { userId, maths, physics, chemistry } = req.body;

    const schema = Joi.object({
      userId: Joi.string(),
      maths: Joi.number().required(),
      physics: Joi.number(),
      chemistry: Joi.number(),
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

    const registration = await StudentRegistration.findOne({ _id: requestId });

    if (!registration) {
      return next(new ErrorResponse("Registration not found", 404));
    }

    const examDetails = await Exam.findById(registration?.examId);

    const studentGrades = [
      {
        subject: examDetails?.name,
        grade: maths,
      },
      // {
      //   subject: "physics",
      //   grade: physics,
      // },
      // {
      //   subject: "chemistry",
      //   grade: chemistry,
      // },
    ];

    await StudentRegistration.findByIdAndUpdate(
      requestId,
      {
        studentGrades,
        updated: new Date().toISOString(),
      },
      { useFindAndModify: false }
    );

    const currentRegistrations = await StudentRegistration.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(requestId),
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

    try {
      await sendEmail({
        to: currentRegistrations[0]?.userDetails?.email,
        subject: "GRADING SYSTEM: You are Graded for the Exam",
        text: `Hi ${currentRegistrations[0]?.userDetails?.firstName} ${currentRegistrations[0]?.userDetails?.lastName}, <div>You are graded for ${examDetails?.name}</div>`,
      });
    } catch (err) {
      console.log("send mail error", err);
    }

    res.status(201).json({
      success: true,
      data: currentRegistrations?.length ? currentRegistrations[0] : {},
    });
  } catch (err) {
    next(err);
  }
};

exports.removeRegistration = async (req, res, next) => {
  try {
    const requestId = req.params.requestId;

    const registration = await StudentRegistration.findOne({ _id: requestId });

    if (!registration) {
      return next(new ErrorResponse("Registration not found", 404));
    }

    await StudentRegistration.deleteOne({ _id: requestId });

    try {
      const userDetails = await User.findById(registration?.userId);
      const examDetails = await Exam.findById(registration?.examId);
      await sendEmail({
        to: userDetails?.email,
        subject: "GRADING SYSTEM: You are registered for the exam",
        text: `Hi ${userDetails?.firstName} ${userDetails?.lastName}, <div>You removed from ${examDetails?.name}</div>`,
      });
    } catch (err) {
      console.log("send mail error", err);
    }

    res.status(200).json({
      success: true,
      data: { result: "SUCCESS" },
    });
  } catch (err) {
    next(err);
  }
};
