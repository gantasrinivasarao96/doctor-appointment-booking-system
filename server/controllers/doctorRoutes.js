const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  applyDoctorController,
  getDoctorProfileController,
} = require("../controllers/doctorController");

const router = express.Router();

// Apply as Doctor
router.post("/apply", authMiddleware, applyDoctorController);

// Get Doctor Profile
router.get("/profile", authMiddleware, getDoctorProfileController);

module.exports = router;
