import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  useNotifications,
} from "../../context/NotificationContext";

import { toast } from "react-toastify";

import NotificationBell from "../NotificationBell";


const markAsReadMock = vi.fn();
const markAllAsReadMock = vi.fn();
const deleteNotificationMock = vi.fn();
const deleteAllNotificationsMock = vi.fn();


vi.mock(
  "../../context/NotificationContext",
  () => ({
    useNotifications: vi.fn(),
  })
);


vi.mock(
  "react-toastify",
  () => ({
    toast: {
      error: vi.fn(),
    },
  })
);


const unreadNotification = {
  _id: "notification-1",
  message: "Appointment approved.",
  read: false,
};


const readNotification = {
  _id: "notification-2",
  message: "Application submitted.",
  read: true,
};


const setNotificationState = (
  overrides = {}
) => {
  useNotifications.mockReturnValue({
    notifications: [
      unreadNotification,
      readNotification,
    ],
    unreadCount: 1,
    loading: false,
    markAsRead: markAsReadMock,
    markAllAsRead: markAllAsReadMock,
    deleteNotification:
      deleteNotificationMock,
    deleteAllNotifications:
      deleteAllNotificationsMock,
    ...overrides,
  });
};


describe(
  "NotificationBell",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      markAsReadMock.mockResolvedValue({
        success: true,
      });

      markAllAsReadMock.mockResolvedValue({
        success: true,
      });

      deleteNotificationMock.mockResolvedValue({
        success: true,
      });

      deleteAllNotificationsMock.mockResolvedValue({
        success: true,
      });

      setNotificationState();
    });


    afterEach(() => {
      cleanup();
    });


    test(
      "shows unread badge and opens notification panel",
      () => {
        render(<NotificationBell />);

        expect(
          screen.getByText("1")
        ).toBeInTheDocument();

        const bellButton =
          screen.getByRole(
            "button",
            {
              name: "Notifications",
            }
          );

        expect(
          bellButton
        ).toHaveAttribute(
          "aria-expanded",
          "false"
        );

        fireEvent.click(bellButton);

        expect(
          bellButton
        ).toHaveAttribute(
          "aria-expanded",
          "true"
        );

        expect(
          screen.getByRole(
            "dialog",
            {
              name:
                "Notification panel",
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Appointment approved."
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Application submitted."
          )
        ).toBeInTheDocument();
      }
    );


    test(
      "caps unread badge at 99+",
      () => {
        setNotificationState({
          unreadCount: 120,
        });

        render(<NotificationBell />);

        expect(
          screen.getByText("99+")
        ).toBeInTheDocument();
      }
    );


    test(
      "marks an unread notification as read",
      async () => {
        render(<NotificationBell />);

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Notifications",
            }
          )
        );

        fireEvent.click(
          screen.getByText(
            "Appointment approved."
          )
        );

        await waitFor(() => {
          expect(
            markAsReadMock
          ).toHaveBeenCalledWith(
            "notification-1"
          );
        });

        expect(
          markAsReadMock
        ).toHaveBeenCalledTimes(1);
      }
    );


    test(
      "does not mark an already read notification again",
      () => {
        render(<NotificationBell />);

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Notifications",
            }
          )
        );

        fireEvent.click(
          screen.getByText(
            "Application submitted."
          )
        );

        expect(
          markAsReadMock
        ).not.toHaveBeenCalled();
      }
    );


    test(
      "marks all notifications as read",
      async () => {
        render(<NotificationBell />);

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Notifications",
            }
          )
        );

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Mark all as read",
            }
          )
        );

        await waitFor(() => {
          expect(
            markAllAsReadMock
          ).toHaveBeenCalledTimes(1);
        });
      }
    );


    test(
      "deletes one notification without marking it as read",
      async () => {
        render(<NotificationBell />);

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Notifications",
            }
          )
        );

        const deleteButtons =
          screen.getAllByRole(
            "button",
            {
              name:
                "Delete notification",
            }
          );

        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(
            deleteNotificationMock
          ).toHaveBeenCalledWith(
            "notification-1"
          );
        });

        expect(
          markAsReadMock
        ).not.toHaveBeenCalled();
      }
    );


    test(
      "deletes all notifications",
      async () => {
        render(<NotificationBell />);

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Notifications",
            }
          )
        );

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Delete all",
            }
          )
        );

        await waitFor(() => {
          expect(
            deleteAllNotificationsMock
          ).toHaveBeenCalledTimes(1);
        });
      }
    );


    test(
      "shows loading and empty states",
      () => {
        setNotificationState({
          notifications: [],
          unreadCount: 0,
          loading: true,
        });

        const { rerender } =
          render(<NotificationBell />);

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Notifications",
            }
          )
        );

        expect(
          screen.getByText(
            "Loading notifications..."
          )
        ).toBeInTheDocument();

        setNotificationState({
          notifications: [],
          unreadCount: 0,
          loading: false,
        });

        rerender(<NotificationBell />);

        expect(
          screen.getByText(
            "No notifications."
          )
        ).toBeInTheDocument();
      }
    );


    test(
      "closes panel when clicking outside",
      () => {
        render(
          <div>
            <NotificationBell />

            <button type="button">
              Outside
            </button>
          </div>
        );

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Notifications",
            }
          )
        );

        expect(
          screen.getByRole(
            "dialog",
            {
              name:
                "Notification panel",
            }
          )
        ).toBeInTheDocument();

        fireEvent.mouseDown(
          screen.getByRole(
            "button",
            {
              name: "Outside",
            }
          )
        );

        expect(
          screen.queryByRole(
            "dialog",
            {
              name:
                "Notification panel",
            }
          )
        ).not.toBeInTheDocument();
      }
    );


    test(
      "shows API error when marking one notification fails",
      async () => {
        markAsReadMock.mockRejectedValueOnce({
          response: {
            data: {
              message:
                "Unable to mark notification",
            },
          },
        });

        render(<NotificationBell />);

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Notifications",
            }
          )
        );

        fireEvent.click(
          screen.getByText(
            "Appointment approved."
          )
        );

        await waitFor(() => {
          expect(
            toast.error
          ).toHaveBeenCalledWith(
            "Unable to mark notification"
          );
        });
      }
    );
  }
);
