const Notification = require("../models/Notification");


// ======================================
// Get Logged-in User Notifications
// ======================================
const getNotificationsController =
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          userId: req.user._id,
        }).sort({
          createdAt: -1,
        });

      const unreadCount =
        await Notification.countDocuments({
          userId: req.user._id,
          read: false,
        });

      return res.status(200).json({
        success: true,
        total: notifications.length,
        unreadCount,
        notifications,
      });
    } catch (error) {
      console.error(
        "Get notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch notifications.",
      });
    }
  };


// ======================================
// Mark One Notification as Read
// ======================================
const markNotificationReadController =
  async (req, res) => {
    try {
      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: req.user._id,
          },
          {
            $set: {
              read: true,
            },
          },
          {
            returnDocument: "after",
            runValidators: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read.",
        notification,
      });
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark notification as read.",
      });
    }
  };


// ======================================
// Mark All Notifications as Read
// ======================================
const markAllNotificationsReadController =
  async (req, res) => {
    try {
      const result =
        await Notification.updateMany(
          {
            userId: req.user._id,
            read: false,
          },
          {
            $set: {
              read: true,
            },
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read.",
        modifiedCount:
          result.modifiedCount,
      });
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark notifications as read.",
      });
    }
  };


// ======================================
// Delete One Notification
// ======================================
const deleteNotificationController =
  async (req, res) => {
    try {
      const notification =
        await Notification.findOneAndDelete({
          _id: req.params.id,
          userId: req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Notification deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete notification.",
      });
    }
  };


// ======================================
// Delete All Notifications
// ======================================
const deleteAllNotificationsController =
  async (req, res) => {
    try {
      const result =
        await Notification.deleteMany({
          userId: req.user._id,
        });

      return res.status(200).json({
        success: true,
        message:
          "All notifications deleted successfully.",
        deletedCount:
          result.deletedCount,
      });
    } catch (error) {
      console.error(
        "Delete all notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete notifications.",
      });
    }
  };


module.exports = {
  getNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  deleteNotificationController,
  deleteAllNotificationsController,
};
