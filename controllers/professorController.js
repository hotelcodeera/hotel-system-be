const Joi = require("joi");
const Exam = require("../models/Exam");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const UserRole = require("../helpers/enums/UserRole");
const sendEmail = require("../utils/sendEmail");
const StudentRegistration = require("../models/StudentRegistration");

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
    if (user?.userType !== UserRole.Professor) {
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
        subject: "League Confirmation",
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
      return next(new ErrorResponse("League Not found", 404, "Not found"));
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
      data: userRegistrationDetails,
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
      data: currentUsers?.length ? currentUsers.map(ele => {return {userName: ele.username, userId: ele._id}}) : [],
    });
  } catch (err) {
    next(err);
  }
};
