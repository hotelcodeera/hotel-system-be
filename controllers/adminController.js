const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const Joi = require("joi");
const UserRole = require("../helpers/enums/UserRole");
const sendEmail = require("../utils/sendEmail");

exports.addUser = async (req, res, next) => {
  const { username, email, firstName, lastName, userType } = req.body;

  try {
    const schema = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().default(""),
      userType: Joi.string().default(UserRole.User),
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

    const user = await User.create({
      username,
      email,
      password: "Kmit123$",
      firstName,
      lastName,
      userType,
    });

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Hotel Code Era",
        text: `Hello, Your account is been created with us.<br></br><div>Email :- ${email} <br></br> <p>Password:-Kmit123$</p><p>Please visit us at :- https://sa42eibs87.execute-api.us-east-1.amazonaws.com/ </p></div>`,
      });
    } catch (err) {
      console.log("send mail error", err);
    }

    res.status(201).json({
      success: true,
      data: `${userType.toLowerCase()} Created Succesfully`,
    });
  } catch (err) {
    next(err);
  }
};
