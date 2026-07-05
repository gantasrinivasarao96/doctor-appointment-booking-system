const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const {
  getPendingDoctorsController,
  approveDoctorController,
  rejectDoctorController,
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
  validateObjectId,
  approveDoctorController
);

// Reject Doctor (Admin Only)
router.put(
  "/doctors/reject/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectId,
  rejectDoctorController
);

module.exports = router;
