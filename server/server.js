const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

// Load Environment Variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());

// ======================
// Import Routes
// ======================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// ======================
// API Routes
// ======================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

// ======================
// Test Route
// ======================
app.get("/", (req, res) => {
  res.send("Doctor Appointment Booking System API is Running...");
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
