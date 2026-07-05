// ======================================
// Admin Middleware
// ======================================
const adminMiddleware = (
  req,
  res,
  next
) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied. Admin only.",
    });
  }

  return next();
};


// ======================================
// Doctor Middleware
// ======================================
const doctorMiddleware = (
  req,
  res,
  next
) => {
  if (!req.user?.isDoctor) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied. Doctors only.",
    });
  }

  return next();
};


module.exports = {
  adminMiddleware,
  doctorMiddleware,
};
