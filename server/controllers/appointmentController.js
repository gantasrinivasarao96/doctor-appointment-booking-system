const Appointment = require("../models/Appointment");

// ======================================
// Book Appointment
// ======================================
const bookAppointmentController = async (req, res) => {
  try {
    const appointment = new Appointment(req.body);

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

module.exports = {
  bookAppointmentController,
  getUserAppointmentsController,
};
