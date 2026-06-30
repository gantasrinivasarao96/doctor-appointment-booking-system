const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  getPendingDoctorsController,
  approveDoctorController,
} = require("../controllers/adminController");

const router = express.Router();

// Get Pending Doctor Applications
router.get("/doctors/pending", authMiddleware, getPendingDoctorsController);

// Approve Doctor
router.put("/doctors/approve/:id", authMiddleware, approveDoctorController);

module.exports = router;
