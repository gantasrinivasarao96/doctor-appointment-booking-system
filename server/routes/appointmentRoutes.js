const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  bookAppointmentController,
  getUserAppointmentsController,
} = require("../controllers/appointmentController");

const router = express.Router();

// Book Appointment
router.post("/book", authMiddleware, bookAppointmentController);

// Get User Appointments
router.get("/user", authMiddleware, getUserAppointmentsController);

module.exports = router;
