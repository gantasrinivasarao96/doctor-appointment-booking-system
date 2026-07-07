import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../services/api";
import { useAuth } from "./AuthContext";


const NotificationContext =
  createContext(null);


// ======================================
// Notification Provider
// ======================================
function NotificationProvider({
  children,
}) {
  const {
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ==================================
  // Reset Notification State
  // ==================================
  const resetNotifications =
    useCallback(() => {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }, []);


  // ==================================
  // Fetch Notifications
  // ==================================
  const fetchNotifications =
    useCallback(async () => {
      if (!isAuthenticated) {
        resetNotifications();
        return;
      }

      setLoading(true);

      try {
        const { data } =
          await API.get(
            "/notification"
          );

        if (data.success) {
          setNotifications(
            Array.isArray(
              data.notifications
            )
              ? data.notifications
              : []
          );

          setUnreadCount(
            Number(
              data.unreadCount
            ) || 0
          );
        }
      } catch (error) {
        console.error(
          "Fetch notifications error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, [
      isAuthenticated,
      resetNotifications,
    ]);


  // ==================================
  // Mark One as Read
  // ==================================
  const markAsRead =
    useCallback(async (id) => {
      const { data } =
        await API.put(
          `/notification/${id}/read`
        );

      if (data.success) {
        setNotifications(
          (current) =>
            current.map(
              (notification) =>
                notification._id === id
                  ? {
                      ...notification,
                      read: true,
                    }
                  : notification
            )
        );

        setUnreadCount(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );
      }

      return data;
    }, []);


  // ==================================
  // Mark All as Read
  // ==================================
  const markAllAsRead =
    useCallback(async () => {
      const { data } =
        await API.put(
          "/notification/read-all"
        );

      if (data.success) {
        setNotifications(
          (current) =>
            current.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            )
        );

        setUnreadCount(0);
      }

      return data;
    }, []);


  // ==================================
  // Delete One
  // ==================================
  const deleteNotification =
    useCallback(async (id) => {
      const { data } =
        await API.delete(
          `/notification/${id}`
        );

      if (data.success) {
        setNotifications(
          (current) => {
            const deleted =
              current.find(
                (notification) =>
                  notification._id === id
              );

            if (
              deleted &&
              !deleted.read
            ) {
              setUnreadCount(
                (count) =>
                  Math.max(
                    0,
                    count - 1
                  )
              );
            }

            return current.filter(
              (notification) =>
                notification._id !== id
            );
          }
        );
      }

      return data;
    }, []);


  // ==================================
  // Delete All
  // ==================================
  const deleteAllNotifications =
    useCallback(async () => {
      const { data } =
        await API.delete(
          "/notification"
        );

      if (data.success) {
        setNotifications([]);
        setUnreadCount(0);
      }

      return data;
    }, []);


  // ==================================
  // Load After Authentication
  // ==================================
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated) {
      fetchNotifications();
    } else {
      resetNotifications();
    }
  }, [
    authLoading,
    isAuthenticated,
    fetchNotifications,
    resetNotifications,
  ]);


  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
    ]
  );


  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
}


// ======================================
// Notification Hook
// ======================================
const useNotifications = () => {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider."
    );
  }

  return context;
};


export {
  NotificationProvider,
  useNotifications,
};
