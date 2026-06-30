const Doctor = require("../models/Doctor");

// Get Pending Doctor Applications
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

module.exports = {
  getPendingDoctorsController,
};
