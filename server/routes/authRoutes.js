const express = require("express");

const {
  registerController,
  loginController,
  getCurrentUserController,
} = require("../controllers/authController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

// Register
router.post("/register", registerController);

// Login
router.post("/login", loginController);

// Current authenticated user
router.get(
  "/me",
  authMiddleware,
  getCurrentUserController
);

module.exports = router;
