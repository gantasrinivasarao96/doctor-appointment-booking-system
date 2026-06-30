const Doctor = require("../models/Doctor");
const User = require("../models/User");

// ======================================
// Get Pending Doctor Applications
// ======================================
const getPendingDoctorsController = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "pending" });

    res.status(200).json({
      success: true,
      total: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending doctors",
      error: error.message,
    });
  }
};

// ======================================
// Approve Doctor
// ======================================
const approveDoctorController = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.status = "approved";
    await doctor.save();

    await User.findByIdAndUpdate(doctor.userId, {
      isDoctor: true,
    });

    res.status(200).json({
      success: true,
      message: "Doctor approved successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Approval failed",
      error: error.message,
    });
  }
};

module.exports = {
  getPendingDoctorsController,
  approveDoctorController,
};
