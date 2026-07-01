const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  applyDoctorController,
  getDoctorProfileController,
  getSingleDoctorController,
  getAllDoctorsController,
} = require("../controllers/doctorController");

const router = express.Router();

// ==========================
// Apply as Doctor
// ==========================
router.post(
  "/apply",
  authMiddleware,
  applyDoctorController
);

// ==========================
// Get Logged-in Doctor Profile
// ==========================
router.get(
  "/profile",
  authMiddleware,
  getDoctorProfileController
);

// ==========================
// Get All Approved Doctors
// ==========================
router.get(
  "/all",
  getAllDoctorsController
);

// ==========================
// Get Single Doctor by ID
// ==========================
router.get(
  "/:id",
  getSingleDoctorController
);

module.exports = router;
