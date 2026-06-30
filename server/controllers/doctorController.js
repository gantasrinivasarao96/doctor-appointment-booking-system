const Doctor = require("../models/Doctor");

// =============================
// Apply as Doctor
// =============================
const applyDoctorController = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);

    doctor.status = "pending";

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

module.exports = {
  applyDoctorController,
  getDoctorProfileController,
};
