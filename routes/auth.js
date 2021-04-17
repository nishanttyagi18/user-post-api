const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { signup, login } = require("../controllers/auth");
const User = require("../models/user");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid Email")
      .custom(async (value) => {
        // console.log(value);
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("Email already exists");
        }
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().isLength({ min: 3 }).not().isEmpty(),
  ],
  signup
);

router.post("/login", login);

module.exports = router;
