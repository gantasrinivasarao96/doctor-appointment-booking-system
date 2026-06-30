const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  bookAppointmentController,
  getUserAppointmentsController,
  getDoctorAppointmentsController,
  updateAppointmentStatusController,
} = require("../controllers/appointmentController");

const router = express.Router();

// Book Appointment
router.post("/book", authMiddleware, bookAppointmentController);

// Get User Appointments
router.get("/user", authMiddleware, getUserAppointmentsController);

// Get Doctor Appointments
router.get("/doctor", authMiddleware, getDoctorAppointmentsController);

// Update Appointment Status
router.put(
  "/update/:id",
  authMiddleware,
  updateAppointmentStatusController
);

module.exports = router;
