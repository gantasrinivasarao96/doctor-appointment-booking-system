const mongoose = require("mongoose");


// ======================================
// Validate ObjectId Route Parameter
// ======================================
const validateObjectId = (
  req,
  res,
  next
) => {
  const { id } = req.params;


  if (
    !mongoose.isObjectIdOrHexString(id)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid resource ID.",
    });
  }


  return next();
};


module.exports = validateObjectId;
