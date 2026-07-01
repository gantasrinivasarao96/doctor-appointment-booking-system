const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  applyDoctorController,
  getDoctorProfileController,
  getAllDoctorsController,
} = require("../controllers/doctorController");

const router = express.Router();

// Apply as Doctor
router.post("/apply", authMiddleware, applyDoctorController);

// Get Doctor Profile
router.get("/profile", authMiddleware, getDoctorProfileController);

// Get All Approved Doctors (Public)
router.get("/all", getAllDoctorsController);

module.exports = router;
