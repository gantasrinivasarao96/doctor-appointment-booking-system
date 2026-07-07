import {
  act,
  cleanup,
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
  NotificationProvider,
  useNotifications,
} from "../NotificationContext";

import API from "../../services/api";
import { useAuth } from "../AuthContext";


vi.mock(
  "../../services/api",
  () => ({
    default: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  })
);


vi.mock(
  "../AuthContext",
  () => ({
    useAuth: vi.fn(),
  })
);


// ======================================
// Test Consumer
// ======================================
function TestConsumer() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  return (
    <div>
      <div data-testid="loading">
        {String(loading)}
      </div>

      <div data-testid="unread-count">
        {unreadCount}
      </div>

      <div data-testid="notification-count">
        {notifications.length}
      </div>

      <div data-testid="notification-list">
        {notifications.map(
          (notification) => (
            <span
              key={notification._id}
              data-testid={`notification-${notification._id}`}
            >
              {notification.message}:
              {String(notification.read)}
            </span>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          markAsRead("notification-1")
        }
      >
        Mark One
      </button>

      <button
        type="button"
        onClick={markAllAsRead}
      >
        Mark All
      </button>

      <button
        type="button"
        onClick={() =>
          deleteNotification(
            "notification-1"
          )
        }
      >
        Delete One
      </button>

      <button
        type="button"
        onClick={deleteAllNotifications}
      >
        Delete All
      </button>
    </div>
  );
}


const renderProvider = () => {
  return render(
    <NotificationProvider>
      <TestConsumer />
    </NotificationProvider>
  );
};


const notificationData = [
  {
    _id: "notification-1",
    message: "First notification",
    read: false,
  },
  {
    _id: "notification-2",
    message: "Second notification",
    read: false,
  },
  {
    _id: "notification-3",
    message: "Third notification",
    read: true,
  },
];


// ======================================
// Test Cleanup
// ======================================
afterEach(() => {
  cleanup();
});


// ======================================
// Notification Context Tests
// ======================================
describe(
  "NotificationContext",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
      });

      API.get.mockResolvedValue({
        data: {
          success: true,
          notifications:
            notificationData,
          unreadCount: 2,
        },
      });
    });


    test(
      "loads notifications after authentication",
      async () => {
        renderProvider();

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "notification-count"
            )
          ).toHaveTextContent("3");
        });

        expect(
          API.get
        ).toHaveBeenCalledWith(
          "/notification"
        );

        expect(
          screen.getByTestId(
            "unread-count"
          )
        ).toHaveTextContent("2");

        expect(
          screen.getByTestId(
            "notification-notification-1"
          )
        ).toHaveTextContent(
          "First notification:false"
        );
      }
    );


    test(
      "does not fetch notifications when unauthenticated",
      async () => {
        useAuth.mockReturnValue({
          isAuthenticated: false,
          loading: false,
        });

        renderProvider();

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "notification-count"
            )
          ).toHaveTextContent("0");
        });

        expect(
          API.get
        ).not.toHaveBeenCalled();

        expect(
          screen.getByTestId(
            "unread-count"
          )
        ).toHaveTextContent("0");
      }
    );


    test(
      "marks one notification as read and decreases unread count",
      async () => {
        API.put.mockResolvedValue({
          data: {
            success: true,
          },
        });

        renderProvider();

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "unread-count"
            )
          ).toHaveTextContent("2");
        });

        await act(async () => {
          screen
            .getByRole(
              "button",
              {
                name: "Mark One",
              }
            )
            .click();
        });

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "notification-notification-1"
            )
          ).toHaveTextContent(
            "First notification:true"
          );
        });

        expect(
          screen.getByTestId(
            "unread-count"
          )
        ).toHaveTextContent("1");

        expect(
          API.put
        ).toHaveBeenCalledWith(
          "/notification/notification-1/read"
        );
      }
    );


    test(
      "marks all notifications as read",
      async () => {
        API.put.mockResolvedValue({
          data: {
            success: true,
          },
        });

        renderProvider();

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "notification-count"
            )
          ).toHaveTextContent("3");
        });

        await act(async () => {
          screen
            .getByRole(
              "button",
              {
                name: "Mark All",
              }
            )
            .click();
        });

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "unread-count"
            )
          ).toHaveTextContent("0");
        });

        expect(
          screen.getByTestId(
            "notification-notification-1"
          )
        ).toHaveTextContent(
          "First notification:true"
        );

        expect(
          screen.getByTestId(
            "notification-notification-2"
          )
        ).toHaveTextContent(
          "Second notification:true"
        );

        expect(
          API.put
        ).toHaveBeenCalledWith(
          "/notification/read-all"
        );
      }
    );


    test(
      "deletes one unread notification and updates unread count",
      async () => {
        API.delete.mockResolvedValue({
          data: {
            success: true,
          },
        });

        renderProvider();

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "notification-count"
            )
          ).toHaveTextContent("3");
        });

        await act(async () => {
          screen
            .getByRole(
              "button",
              {
                name: "Delete One",
              }
            )
            .click();
        });

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "notification-count"
            )
          ).toHaveTextContent("2");
        });

        expect(
          screen.queryByTestId(
            "notification-notification-1"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.getByTestId(
            "unread-count"
          )
        ).toHaveTextContent("1");

        expect(
          API.delete
        ).toHaveBeenCalledWith(
          "/notification/notification-1"
        );
      }
    );


    test(
      "deletes all notifications and resets unread count",
      async () => {
        API.delete.mockResolvedValue({
          data: {
            success: true,
          },
        });

        renderProvider();

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "notification-count"
            )
          ).toHaveTextContent("3");
        });

        await act(async () => {
          screen
            .getByRole(
              "button",
              {
                name: "Delete All",
              }
            )
            .click();
        });

        await waitFor(() => {
          expect(
            screen.getByTestId(
              "notification-count"
            )
          ).toHaveTextContent("0");
        });

        expect(
          screen.getByTestId(
            "unread-count"
          )
        ).toHaveTextContent("0");

        expect(
          API.delete
        ).toHaveBeenCalledWith(
          "/notification"
        );
      }
    );
  }
);
