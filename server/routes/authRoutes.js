const express = require("express");

const {
  registerController,
  loginController,
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", registerController);

// Login
router.post("/login", loginController);

module.exports = router;
