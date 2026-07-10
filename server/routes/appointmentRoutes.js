const express = require("express");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validateObjectId = require(
  "../middleware/validateObjectId"
);

const {
  uploadMedicalDocument,
} = require(
  "../middleware/medicalDocumentUpload"
);

const {
  doctorMiddleware,
} = require(
  "../middleware/roleMiddleware"
);

const {
  getAvailableSlotsController,
  bookAppointmentController,
  getUserAppointmentsController,
  getDoctorAppointmentsController,
  updateAppointmentStatusController,
  getMedicalDocumentController,
} = require(
  "../controllers/appointmentController"
);


const router = express.Router();


// Available slots for doctor + date
router.get(
  "/available-slots",
  authMiddleware,
  getAvailableSlotsController
);


// Book appointment
router.post(
  "/book",
  authMiddleware,
  uploadMedicalDocument,
  bookAppointmentController
);


// Patient appointments
router.get(
  "/user",
  authMiddleware,
  getUserAppointmentsController
);


// Doctor appointments
router.get(
  "/doctor",
  authMiddleware,
  doctorMiddleware,
  getDoctorAppointmentsController
);


// Doctor accesses an appointment medical document
router.get(
  "/:id/medical-document",
  authMiddleware,
  doctorMiddleware,
  validateObjectId,
  getMedicalDocumentController
);


// Doctor updates appointment status
router.put(
  "/update/:id",
  authMiddleware,
  doctorMiddleware,
  validateObjectId,
  updateAppointmentStatusController
);


module.exports = router;
