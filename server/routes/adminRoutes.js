const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const {
  getPendingDoctorsController,
  approveDoctorController,
} = require("../controllers/adminController");

const router = express.Router();

// Get Pending Doctors (Admin Only)
router.get(
  "/doctors/pending",
  authMiddleware,
  adminMiddleware,
  getPendingDoctorsController
);

// Approve Doctor (Admin Only)
router.put(
  "/doctors/approve/:id",
  authMiddleware,
  adminMiddleware,
  approveDoctorController
);

module.exports = router;
