const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
const registerController = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    await user.save();

    return res.status(201).send({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "Registration failed",
      error,
    });
  }
};

module.exports = {
  registerController,
};
