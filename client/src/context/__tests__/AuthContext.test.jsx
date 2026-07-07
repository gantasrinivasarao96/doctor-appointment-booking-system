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

import API from "../../services/api";

import {
  AuthProvider,
  useAuth,
} from "../AuthContext";


vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));


// ======================================
// Authentication State Probe
// ======================================
function AuthStateProbe() {
  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  if (loading) {
    return <div>loading</div>;
  }

  return (
    <div>
      <div>
        {isAuthenticated
          ? "authenticated"
          : "unauthenticated"}
      </div>

      <div>
        {user?.email || "no-user"}
      </div>
    </div>
  );
}


const renderAuthProvider = () =>
  render(
    <AuthProvider>
      <AuthStateProbe />
    </AuthProvider>
  );


// ======================================
// Auth Context
// ======================================
describe(
  "AuthContext",
  () => {
    beforeEach(() => {
      localStorage.clear();
      API.get.mockReset();
    });


    afterEach(() => {
      cleanup();
      localStorage.clear();
    });


    test(
      "starts unauthenticated when no token exists",
      async () => {
        renderAuthProvider();

        expect(
          await screen.findByText(
            "unauthenticated"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText("no-user")
        ).toBeInTheDocument();

        expect(API.get).not.toHaveBeenCalled();
      }
    );


    test(
      "restores the authenticated user from the server",
      async () => {
        const serverUser = {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
          phone: "9876543210",
          isAdmin: false,
          isDoctor: false,
        };

        localStorage.setItem(
          "token",
          "valid-token"
        );

        API.get.mockResolvedValueOnce({
          data: {
            success: true,
            user: serverUser,
          },
        });

        renderAuthProvider();

        expect(
          await screen.findByText(
            "authenticated"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "test@example.com"
          )
        ).toBeInTheDocument();

        expect(API.get).toHaveBeenCalledWith(
          "/auth/me"
        );

        expect(
          JSON.parse(
            localStorage.getItem("user")
          )
        ).toEqual(serverUser);
      }
    );


    test(
      "clears the session when server validation fails",
      async () => {
        localStorage.setItem(
          "token",
          "expired-token"
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            email: "stale@example.com",
          })
        );

        API.get.mockRejectedValueOnce(
          new Error("Unauthorized")
        );

        renderAuthProvider();

        expect(
          await screen.findByText(
            "unauthenticated"
          )
        ).toBeInTheDocument();

        expect(
          localStorage.getItem("token")
        ).toBeNull();

        expect(
          localStorage.getItem("user")
        ).toBeNull();
      }
    );


    test(
      "becomes unauthenticated after unauthorized event",
      async () => {
        const serverUser = {
          id: "user-2",
          name: "Event User",
          email: "event@example.com",
          phone: "9876543210",
          isAdmin: false,
          isDoctor: false,
        };

        localStorage.setItem(
          "token",
          "valid-token"
        );

        API.get.mockResolvedValueOnce({
          data: {
            success: true,
            user: serverUser,
          },
        });

        renderAuthProvider();

        expect(
          await screen.findByText(
            "authenticated"
          )
        ).toBeInTheDocument();

        act(() => {
          window.dispatchEvent(
            new Event("auth:unauthorized")
          );
        });

        await waitFor(() => {
          expect(
            screen.getByText(
              "unauthenticated"
            )
          ).toBeInTheDocument();
        });

        expect(
          screen.getByText("no-user")
        ).toBeInTheDocument();
      }
    );
  }
);
