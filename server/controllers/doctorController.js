const Doctor = require("../models/Doctor");

// Apply as Doctor
const applyDoctorController = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);

    doctor.status = "pending";

    await doctor.save();

    return res.status(201).json({
      success: true,
      message: "Doctor application submitted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Doctor application failed",
      error: error.message,
    });
  }
};

module.exports = {
  applyDoctorController,
};
