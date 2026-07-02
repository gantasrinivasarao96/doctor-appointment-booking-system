const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// ======================================
// Book Appointment
// ======================================
const bookAppointmentController = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
    } = req.body;

    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This appointment slot is already booked.",
      });
    }
    const appointment = new Appointment({
  ...req.body,
  userId: req.user._id,
});

    appointment.status = "Pending";

    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

// ======================================
// Get User Appointments
// ======================================
const getUserAppointmentsController = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userId: req.user._id,
    }).populate("doctorId");

    res.status(200).json({
      success: true,
      total: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user appointments",
      error: error.message,
    });
  }
};

// ======================================
// Get Doctor Appointments
// ======================================
const getDoctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      userId: req.user._id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointments = await Appointment.find({
      doctorId: doctor._id,
    }).populate("userId", "-password");

    res.status(200).json({
      success: true,
      total: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor appointments",
      error: error.message,
    });
  }
};

// ======================================
// Update Appointment Status
// ======================================
const updateAppointmentStatusController = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
      error: error.message,
    });
  }
};

module.exports = {
  bookAppointmentController,
  getUserAppointmentsController,
  getDoctorAppointmentsController,
  updateAppointmentStatusController,
};

