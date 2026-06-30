const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getUserProfile } = require("../controllers/userController");

const router = express.Router();

// Protected Profile Route
router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;
