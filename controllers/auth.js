const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// User Signup Controller
exports.signup = async (req, res, next) => {
  // Handling validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  try {
    // Creating Hash of Password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
    });

    // Saving the user to database
    const savedUser = await user.save();
    if (savedUser) {
      res.status(201).json({ message: "User created!", userId: savedUser._id });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// User Login Controller
exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Finding user in database
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User Couldn't be found.");
      error.statusCode = 401;
      return next(error);
    }

    // Matching the Password
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password.");
      error.statusCode = 401;
      return next(error);
    }

    // Generating JWT token
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      token: token,
      userId: user._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
