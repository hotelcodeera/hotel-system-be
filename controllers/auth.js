const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const UserRole = require("../helpers/enums/UserRole");
const Joi = require("joi");

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
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

    // Check that user exists by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check that password match
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;

  try {
    const schema = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().default(""),
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

    // Check that user exists by email
    const currentUser = await User.findOne({ email }).select("+password");

    if (currentUser) {
      return next(new ErrorResponse("User Already Exists", 400));
    }

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      userType: UserRole.User,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    });

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ sucess: true, token });
};
