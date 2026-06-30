const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { applyDoctorController } = require("../controllers/doctorController");

const router = express.Router();

// Apply as Doctor
router.post("/apply", authMiddleware, applyDoctorController);

module.exports = router;
