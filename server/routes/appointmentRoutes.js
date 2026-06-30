const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { doctorMiddleware } = require("../middleware/roleMiddleware");

const {
  bookAppointmentController,
  getUserAppointmentsController,
  getDoctorAppointmentsController,
  updateAppointmentStatusController,
} = require("../controllers/appointmentController");

const router = express.Router();

// Book Appointment
router.post("/book", authMiddleware, bookAppointmentController);

// User Appointments
router.get("/user", authMiddleware, getUserAppointmentsController);

// Doctor Appointments (Doctor Only)
router.get(
  "/doctor",
  authMiddleware,
  doctorMiddleware,
  getDoctorAppointmentsController
);

// Update Appointment Status (Doctor Only)
router.put(
  "/update/:id",
  authMiddleware,
  doctorMiddleware,
  updateAppointmentStatusController
);

module.exports = router;
