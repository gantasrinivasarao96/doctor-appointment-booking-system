import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaBell,
  FaCheckDouble,
  FaTrash,
} from "react-icons/fa";

import { toast } from "react-toastify";

import {
  useNotifications,
} from "../context/NotificationContext";


// ======================================
// Notification Bell
// ======================================
function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] =
    useState(false);

  const containerRef = useRef(null);


  // ==================================
  // Close on Outside Click
  // ==================================
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  // ==================================
  // Mark One Notification
  // ==================================
  const handleNotificationClick =
    async (notification) => {
      if (notification.read) {
        return;
      }

      try {
        await markAsRead(
          notification._id
        );
      } catch (error) {
        console.error(
          "Mark notification read error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to mark notification as read."
        );
      }
    };


  // ==================================
  // Mark All as Read
  // ==================================
  const handleMarkAllAsRead =
    async () => {
      try {
        await markAllAsRead();
      } catch (error) {
        console.error(
          "Mark all notifications read error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to mark notifications as read."
        );
      }
    };


  // ==================================
  // Delete One Notification
  // ==================================
  const handleDelete =
    async (event, id) => {
      event.stopPropagation();

      try {
        await deleteNotification(id);
      } catch (error) {
        console.error(
          "Delete notification error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to delete notification."
        );
      }
    };


  // ==================================
  // Delete All Notifications
  // ==================================
  const handleDeleteAll =
    async () => {
      try {
        await deleteAllNotifications();
      } catch (error) {
        console.error(
          "Delete all notifications error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to delete notifications."
        );
      }
    };


  return (
    <div
      className="notification-bell-container"
      ref={containerRef}
    >
      <button
        type="button"
        className="notification-bell-button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (current) => !current
          )
        }
      >
        <FaBell />

        {unreadCount > 0 && (
          <span
            className="notification-count-badge"
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>


      {isOpen && (
        <div
          className="notification-dropdown"
          role="dialog"
          aria-label="Notification panel"
        >
          <div
            className="notification-dropdown-header"
          >
            <div>
              <strong>
                Notifications
              </strong>

              <div
                className="notification-header-summary"
              >
                {unreadCount} unread
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-action-button"
                onClick={
                  handleMarkAllAsRead
                }
                title="Mark all as read"
                aria-label="Mark all as read"
              >
                <FaCheckDouble />
              </button>
            )}
          </div>


          <div
            className="notification-list"
          >
            {loading ? (
              <div
                className="notification-empty-state"
              >
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div
                className="notification-empty-state"
              >
                No notifications.
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <div
                    key={notification._id}
                    className={
                      notification.read
                        ? "notification-item"
                        : "notification-item notification-item-unread"
                    }
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        handleNotificationClick(
                          notification
                        );
                      }
                    }}
                  >
                    <div
                      className="notification-message"
                    >
                      {notification.message}
                    </div>

                    <button
                      type="button"
                      className="notification-delete-button"
                      aria-label="Delete notification"
                      onClick={(event) =>
                        handleDelete(
                          event,
                          notification._id
                        )
                      }
                    >
                      <FaTrash />
                    </button>
                  </div>
                )
              )
            )}
          </div>


          {notifications.length > 0 && (
            <div
              className="notification-dropdown-footer"
            >
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={handleDeleteAll}
              >
                Delete all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default NotificationBell;
