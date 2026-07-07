const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Notification = require("../models/Notification");


// ======================================
// Get Pending Doctor Applications
// ======================================
const getPendingDoctorsController =
  async (req, res) => {
    try {
      const doctors =
        await Doctor.find({
          status: "pending",
        }).sort({
          createdAt: 1,
        });


      return res.status(200).json({
        success: true,
        total: doctors.length,
        doctors,
      });

    } catch (error) {
      console.error(
        "Get pending doctors error:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch pending doctors.",
      });
    }
  };


// ======================================
// Approve Doctor
//
// Allowed transition:
// pending -> approved
// ======================================
const approveDoctorController =
  async (req, res) => {
    try {
      const doctor =
        await Doctor.findById(
          req.params.id
        );


      if (!doctor) {
        return res.status(404).json({
          success: false,
          message:
            "Doctor not found.",
        });
      }


      if (
        doctor.status !== "pending"
      ) {
        return res.status(409).json({
          success: false,
          message:
            `Cannot approve doctor application from ${doctor.status} status.`,
        });
      }


      const user =
        await User.findById(
          doctor.userId
        );


      if (!user) {
        return res.status(409).json({
          success: false,
          message:
            "Associated user account not found.",
        });
      }


      doctor.status = "approved";

      await doctor.save();


      user.isDoctor = true;

      await user.save();


      // Notify applicant about approval.
      try {
        await Notification.create({
          userId: user._id,
          message:
            "Your doctor application has been approved.",
        });
      } catch (notificationError) {
        console.error(
          "Doctor approval notification error:",
          notificationError
        );
      }


      return res.status(200).json({
        success: true,
        message:
          "Doctor approved successfully.",
      });

    } catch (error) {
      console.error(
        "Approve doctor error:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Doctor approval failed.",
      });
    }
  };


// ======================================
// Reject Doctor
//
// Allowed transition:
// pending -> rejected
// ======================================
const rejectDoctorController =
  async (req, res) => {
    try {
      const doctor =
        await Doctor.findById(
          req.params.id
        );


      if (!doctor) {
        return res.status(404).json({
          success: false,
          message:
            "Doctor not found.",
        });
      }


      if (
        doctor.status !== "pending"
      ) {
        return res.status(409).json({
          success: false,
          message:
            `Cannot reject doctor application from ${doctor.status} status.`,
        });
      }


      const user =
        await User.findById(
          doctor.userId
        );


      if (!user) {
        return res.status(409).json({
          success: false,
          message:
            "Associated user account not found.",
        });
      }


      doctor.status = "rejected";

      await doctor.save();


      user.isDoctor = false;

      await user.save();


      // Notify applicant about rejection.
      try {
        await Notification.create({
          userId: user._id,
          message:
            "Your doctor application has been rejected.",
        });
      } catch (notificationError) {
        console.error(
          "Doctor rejection notification error:",
          notificationError
        );
      }


      return res.status(200).json({
        success: true,
        message:
          "Doctor rejected successfully.",
      });

    } catch (error) {
      console.error(
        "Reject doctor error:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Doctor rejection failed.",
      });
    }
  };


// ======================================
// Exports
// ======================================
module.exports = {
  getPendingDoctorsController,
  approveDoctorController,
  rejectDoctorController,
};
