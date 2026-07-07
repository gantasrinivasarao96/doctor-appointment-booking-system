import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import { toast } from "react-toastify";

import API from "../../services/api";

import {
  useAuth,
} from "../../context/AuthContext";

import Login from "../Login";


vi.mock(
  "../../services/api",
  () => ({
    default: {
      post: vi.fn(),
    },
  })
);


vi.mock(
  "../../context/AuthContext",
  () => ({
    useAuth: vi.fn(),
  })
);


vi.mock(
  "react-toastify",
  () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  })
);


// ======================================
// Simplify Layout Components
// ======================================
vi.mock(
  "../../components/Navbar",
  () => ({
    default: () => <div>Navbar</div>,
  })
);


vi.mock(
  "../../components/Footer",
  () => ({
    default: () => <div>Footer</div>,
  })
);


// ======================================
// Location Probe
// ======================================
function LocationProbe() {
  const location = useLocation();

  return (
    <div data-testid="location">
      {location.pathname}
    </div>
  );
}


// ======================================
// Test Helpers
// ======================================
const setSession = vi.fn();


const renderLogin = ({
  state,
} = {}) =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: "/login",
          state,
        },
      ]}
    >
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="*"
          element={<LocationProbe />}
        />
      </Routes>
    </MemoryRouter>
  );


const submitLoginForm = ({
  email = "test@example.com",
  password = "password123",
} = {}) => {
  fireEvent.change(
    screen.getByPlaceholderText(
      "Enter your email"
    ),
    {
      target: {
        name: "email",
        value: email,
      },
    }
  );

  fireEvent.change(
    screen.getByPlaceholderText(
      "Enter your password"
    ),
    {
      target: {
        name: "password",
        value: password,
      },
    }
  );

  fireEvent.click(
    screen.getByRole(
      "button",
      {
        name: "Login",
      }
    )
  );
};


// ======================================
// Login
// ======================================
describe(
  "Login",
  () => {
    beforeEach(() => {
      API.post.mockReset();

      setSession.mockReset();

      toast.success.mockReset();
      toast.error.mockReset();

      useAuth.mockReturnValue({
        setSession,
      });
    });


    afterEach(() => {
      cleanup();
    });


    test(
      "logs in a normal user and redirects to user dashboard",
      async () => {
        const user = {
          id: "user-1",
          email: "user@example.com",
          isAdmin: false,
          isDoctor: false,
        };

        API.post.mockResolvedValueOnce({
          data: {
            token: "user-token",
            user,
            message: "Welcome back",
          },
        });

        renderLogin();

        submitLoginForm({
          email: "user@example.com",
          password: "secret123",
        });

        await waitFor(() => {
          expect(API.post).toHaveBeenCalledWith(
            "/auth/login",
            {
              email: "user@example.com",
              password: "secret123",
            }
          );
        });

        expect(setSession).toHaveBeenCalledWith(
          "user-token",
          user
        );

        expect(
          toast.success
        ).toHaveBeenCalledWith(
          "Welcome back"
        );

        expect(
          await screen.findByTestId("location")
        ).toHaveTextContent(
          "/user/dashboard"
        );
      }
    );


    test(
      "preserves redirect destination for a normal user",
      async () => {
        const user = {
          id: "user-2",
          email: "redirect@example.com",
          isAdmin: false,
          isDoctor: false,
        };

        API.post.mockResolvedValueOnce({
          data: {
            token: "redirect-token",
            user,
          },
        });

        renderLogin({
          state: {
            redirectTo: "/book/doctor-123",
          },
        });

        submitLoginForm();

        expect(
          await screen.findByTestId("location")
        ).toHaveTextContent(
          "/book/doctor-123"
        );

        expect(setSession).toHaveBeenCalledWith(
          "redirect-token",
          user
        );
      }
    );


    test(
      "redirects a doctor to doctor dashboard",
      async () => {
        const user = {
          id: "doctor-1",
          email: "doctor@example.com",
          isAdmin: false,
          isDoctor: true,
        };

        API.post.mockResolvedValueOnce({
          data: {
            token: "doctor-token",
            user,
          },
        });

        renderLogin({
          state: {
            redirectTo: "/book/doctor-999",
          },
        });

        submitLoginForm();

        expect(
          await screen.findByTestId("location")
        ).toHaveTextContent(
          "/doctor/dashboard"
        );

        expect(setSession).toHaveBeenCalledWith(
          "doctor-token",
          user
        );
      }
    );


    test(
      "redirects an admin to admin dashboard",
      async () => {
        const user = {
          id: "admin-1",
          email: "admin@example.com",
          isAdmin: true,
          isDoctor: false,
        };

        API.post.mockResolvedValueOnce({
          data: {
            token: "admin-token",
            user,
          },
        });

        renderLogin({
          state: {
            redirectTo: "/book/doctor-999",
          },
        });

        submitLoginForm();

        expect(
          await screen.findByTestId("location")
        ).toHaveTextContent(
          "/admin/dashboard"
        );

        expect(setSession).toHaveBeenCalledWith(
          "admin-token",
          user
        );
      }
    );


    test(
      "shows server error and does not create a session",
      async () => {
        API.post.mockRejectedValueOnce({
          response: {
            data: {
              message: "Invalid credentials",
            },
          },
        });

        renderLogin();

        submitLoginForm();

        await waitFor(() => {
          expect(
            toast.error
          ).toHaveBeenCalledWith(
            "Invalid credentials"
          );
        });

        expect(
          setSession
        ).not.toHaveBeenCalled();

        expect(
          screen.getByRole(
            "button",
            {
              name: "Login",
            }
          )
        ).not.toBeDisabled();
      }
    );
  }
);
