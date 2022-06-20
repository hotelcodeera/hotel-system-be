const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const Joi = require('joi');
const UserRole = require("../helpers/enums/UserRole");

exports.addUser = async (req, res, next) => {
  const { username, email, firstName, lastName, userType } = req.body;

  try {
    
    const schema  = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().default(""),
      userType: Joi.string().default(UserRole.User)
    });
  
    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true // remove unknown props
    };
  
    const { error } = schema.validate(req.body, options);
  
    if(error?.details){
      return next(new ErrorResponse(error?.details[0]?.message || "Bad Request", 400, "ValidationError"));
    }

    const user = await User.create({
      username,
      email,
      password: "Kmit123$",
      firstName,
      lastName,
      userType,
    });

    res.status(201).json({
        success: true,
        data: `${userType.toLowerCase()} Created Succesfully`,
      });
  } catch (err) {
    next(err);
  }
  };