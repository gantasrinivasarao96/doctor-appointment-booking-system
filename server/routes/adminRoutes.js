const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  getPendingDoctorsController,
} = require("../controllers/adminController");

const router = express.Router();

// Get Pending Doctor Applications
router.get("/doctors/pending", authMiddleware, getPendingDoctorsController);

module.exports = router;
