const mongoose = require("mongoose");


// ======================================
// Appointment Schema
// ======================================
const appointmentSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },


      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
        index: true,
      },


      appointmentDate: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/,
      },


      appointmentTime: {
        type: String,
        required: true,
        match:
          /^([01]\d|2[0-3]):([0-5]\d)$/,
      },


      medicalDocument: {
        type: String,
        default: "",
        trim: true,
      },


      status: {
        type: String,

        enum: [
          "Pending",
          "Approved",
          "Rejected",
          "Completed",
        ],

        default: "Pending",

        required: true,
      },
    },
    {
      timestamps: true,
    }
  );


// ======================================
// Database-Level Double Booking Guard
//
// Only active appointments block a slot.
//
// Rejected and Completed appointments
// do not prevent future booking.
// ======================================
appointmentSchema.index(
  {
    doctorId: 1,
    appointmentDate: 1,
    appointmentTime: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      status: {
        $in: [
          "Pending",
          "Approved",
        ],
      },
    },

    name: "unique_active_doctor_slot",
  }
);


// ======================================
// Query Indexes
// ======================================
appointmentSchema.index({
  userId: 1,
  createdAt: -1,
});

appointmentSchema.index({
  doctorId: 1,
  appointmentDate: 1,
});


// ======================================
// Export Model
// ======================================
module.exports = mongoose.model(
  "Appointment",
  appointmentSchema
);
