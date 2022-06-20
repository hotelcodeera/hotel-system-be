const Joi = require("joi");
const Exam = require("../models/Exam");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const StudentRegistration = require("../models/StudentRegistration");

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
    console.log("exam", exam);
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

exports.findRegistration = async (req, res, next) => {
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
  
      const exam = await Exam.findById(examId);
      console.log("exam", exam);
      if (!exam) {
        return next(new ErrorResponse("Exam Not found", 404, "Not found"));
      }
  
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

