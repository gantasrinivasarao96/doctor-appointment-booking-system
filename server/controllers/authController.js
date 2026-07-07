const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require(
  "../utils/generateToken"
);


// ======================================
// Email Normalization
// ======================================
const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();


// ======================================
// Registration Validation
// ======================================
const validateRegistrationInput = ({
  name,
  email,
  password,
  phone,
}) => {
  const normalizedName =
    String(name || "").trim();

  const normalizedEmail =
    normalizeEmail(email);

  const normalizedPhone =
    String(phone || "").trim();


  if (
    !normalizedName ||
    !normalizedEmail ||
    !password ||
    !normalizedPhone
  ) {
    return {
      valid: false,
      message:
        "Name, email, password and phone are required.",
    };
  }


  if (
    normalizedName.length < 2 ||
    normalizedName.length > 100
  ) {
    return {
      valid: false,
      message:
        "Name must be between 2 and 100 characters.",
    };
  }


  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if (
    normalizedEmail.length > 254 ||
    !emailPattern.test(
      normalizedEmail
    )
  ) {
    return {
      valid: false,
      message:
        "Please provide a valid email address.",
    };
  }


  if (
    typeof password !== "string" ||
    password.length < 8
  ) {
    return {
      valid: false,
      message:
        "Password must be at least 8 characters.",
    };
  }


  if (password.length > 128) {
    return {
      valid: false,
      message:
        "Password cannot exceed 128 characters.",
    };
  }


  if (
    !/^[6-9]\d{9}$/.test(
      normalizedPhone
    )
  ) {
    return {
      valid: false,
      message:
        "Please provide a valid 10-digit Indian mobile number.",
    };
  }


  return {
    valid: true,

    values: {
      name: normalizedName,
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
    },
  };
};


// ======================================
// Safe User Response
// ======================================
const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  isAdmin: user.isAdmin,
  isDoctor: user.isDoctor,
});


// ======================================
// Register User
// ======================================
const registerController =
  async (req, res) => {
    try {
      const validation =
        validateRegistrationInput(
          req.body
        );


      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.message,
        });
      }


      const {
        name,
        email,
        password,
        phone,
      } = validation.values;


      const existingUser =
        await User.findOne({
          email,
        }).lean();


      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists.",
        });
      }


      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      const user =
        await User.create({
          name,
          email,
          password:
            hashedPassword,
          phone,
        });


      return res.status(201).json({
        success: true,
        message:
          "Registration successful",
        token:
          generateToken(user._id),
        user:
          buildUserResponse(user),
      });

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );


      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists.",
        });
      }


      if (
        error?.name ===
        "ValidationError"
      ) {
        const firstError =
          Object.values(
            error.errors
          )[0];

        return res.status(400).json({
          success: false,
          message:
            firstError?.message ||
            "Invalid registration data.",
        });
      }


      return res.status(500).json({
        success: false,
        message:
          "Registration failed.",
      });
    }
  };


// ======================================
// Login User
// ======================================
const loginController =
  async (req, res) => {
    try {
      const email =
        normalizeEmail(
          req.body.email
        );

      const password =
        req.body.password;


      if (
        !email ||
        typeof password !== "string" ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required.",
        });
      }


      const user =
        await User.findOne({
          email,
        }).select("+password");


      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }


      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }


      return res.status(200).json({
        success: true,
        message:
          "Login successful",
        token:
          generateToken(user._id),
        user:
          buildUserResponse(user),
      });

    } catch (error) {
      console.error(
        "Login error:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Login failed.",
      });
    }
  };


// ======================================
// Get Current User
// ======================================
const getCurrentUserController = (
  req,
  res
) => {
  return res.status(200).json({
    success: true,
    user:
      buildUserResponse(req.user),
  });
};


// ======================================
// Exports
// ======================================
module.exports = {
  registerController,
  loginController,
  getCurrentUserController,
};
