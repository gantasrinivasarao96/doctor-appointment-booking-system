const Doctor = require("../models/Doctor");

// =============================
// Apply as Doctor
// =============================
const applyDoctorController = async (req, res) => {
  try {
    // Check if already applied
    const existingDoctor = await Doctor.findOne({
      userId: req.user._id,
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "You have already applied as a doctor.",
      });
    }

    const doctor = new Doctor({
      userId: req.user._id,
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      specialization: req.body.specialization,
      experience: req.body.experience,
      fees: req.body.fees,
      address: req.body.address,
      timings: req.body.timings,
      status: "pending",
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor application submitted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Doctor application failed",
      error: error.message,
    });
  }
};

// =============================
// Get Doctor Profile
// =============================
const getDoctorProfileController = async (req, res) => {
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

    res.status(200).json({
      success: true,
      doctor,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
      error: error.message,
    });
  }
};
// =============================
// Get Single Doctor
// =============================
const getSingleDoctorController = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
      error: error.message,
    });
  }
};

// =============================
// Get All Approved Doctors
// =============================
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      status: "approved",
    });

    res.status(200).json({
      success: true,
      total: doctors.length,
      doctors,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch approved doctors",
      error: error.message,
    });
  }
};

module.exports = {
  applyDoctorController,
  getDoctorProfileController,
  getSingleDoctorController,
  getAllDoctorsController,
};
