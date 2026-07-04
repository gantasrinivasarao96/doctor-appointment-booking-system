const mongoose = require("mongoose");


// ======================================
// User Schema
// ======================================
const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: [
          true,
          "Name is required.",
        ],
        trim: true,
        minlength: [
          2,
          "Name must be at least 2 characters.",
        ],
        maxlength: [
          100,
          "Name cannot exceed 100 characters.",
        ],
      },


      email: {
        type: String,
        required: [
          true,
          "Email is required.",
        ],
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [
          254,
          "Email is too long.",
        ],
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please provide a valid email address.",
        ],
      },


      password: {
        type: String,
        required: [
          true,
          "Password is required.",
        ],
        minlength: [
          8,
          "Password must be at least 8 characters.",
        ],
        select: false,
      },


      phone: {
        type: String,
        required: [
          true,
          "Phone number is required.",
        ],
        trim: true,
        match: [
          /^[6-9]\d{9}$/,
          "Please provide a valid 10-digit Indian mobile number.",
        ],
      },


      isAdmin: {
        type: Boolean,
        default: false,
      },


      isDoctor: {
        type: Boolean,
        default: false,
      },


      notification: {
        type: Array,
        default: [],
      },


      seenNotification: {
        type: Array,
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );


// ======================================
// Export Model
// ======================================
module.exports = mongoose.model(
  "User",
  userSchema
);
