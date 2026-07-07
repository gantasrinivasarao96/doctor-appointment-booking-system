const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  deleteNotificationController,
  deleteAllNotificationsController,
} = require(
  "../controllers/notificationController"
);


const router = express.Router();


// All notification routes require login
router.use(authMiddleware);


// Get notifications
router.get(
  "/",
  getNotificationsController
);


// Mark all as read
// Keep this before /:id/read for clarity
router.put(
  "/read-all",
  markAllNotificationsReadController
);


// Mark one as read
router.put(
  "/:id/read",
  markNotificationReadController
);


// Delete all notifications
// Keep this before /:id
router.delete(
  "/",
  deleteAllNotificationsController
);


// Delete one notification
router.delete(
  "/:id",
  deleteNotificationController
);


module.exports = router;
