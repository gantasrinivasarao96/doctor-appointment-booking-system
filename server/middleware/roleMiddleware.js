const User = require("../models/User");

// ======================================
// Admin Middleware
// ======================================
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Authorization failed",
      error: error.message,
    });
  }
};

// ======================================
// Doctor Middleware
// ======================================
const doctorMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.isDoctor) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Doctors only.",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Authorization failed",
      error: error.message,
    });
  }
};

module.exports = {
  adminMiddleware,
  doctorMiddleware,
};
