const express = require("express");
const cors = require("cors");

const authRoutes = require(
  "./routes/authRoutes"
);
const userRoutes = require(
  "./routes/userRoutes"
);
const doctorRoutes = require(
  "./routes/doctorRoutes"
);
const adminRoutes = require(
  "./routes/adminRoutes"
);
const appointmentRoutes = require(
  "./routes/appointmentRoutes"
);


const app = express();


// ======================================
// Middleware
// ======================================
app.use(cors());
app.use(express.json());


// ======================================
// API Routes
// ======================================
app.use(
  "/api/v1/auth",
  authRoutes
);

app.use(
  "/api/v1/user",
  userRoutes
);

app.use(
  "/api/v1/doctor",
  doctorRoutes
);

app.use(
  "/api/v1/admin",
  adminRoutes
);

app.use(
  "/api/v1/appointment",
  appointmentRoutes
);


// ======================================
// Health Route
// ======================================
app.get("/", (req, res) => {
  return res.send(
    "Doctor Appointment Booking System API is Running..."
  );
});


module.exports = app;
