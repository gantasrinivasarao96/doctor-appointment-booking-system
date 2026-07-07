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

import Register from "../Register";


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


const renderRegister = () =>
  render(
    <MemoryRouter
      initialEntries={["/register"]}
    >
      <Routes>
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="*"
          element={<LocationProbe />}
        />
      </Routes>
    </MemoryRouter>
  );


const fillRegistrationForm = ({
  name = "Test User",
  email = "test@example.com",
  phone = "9876543210",
  password = "password123",
} = {}) => {
  fireEvent.change(
    screen.getByPlaceholderText(
      "Enter your full name"
    ),
    {
      target: {
        name: "name",
        value: name,
      },
    }
  );

  fireEvent.change(
    screen.getByPlaceholderText(
      "example@gmail.com"
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
      "Enter the phone number"
    ),
    {
      target: {
        name: "phone",
        value: phone,
      },
    }
  );

  fireEvent.change(
    screen.getByPlaceholderText(
      "Create password"
    ),
    {
      target: {
        name: "password",
        value: password,
      },
    }
  );
};


const submitRegistrationForm = () => {
  fireEvent.click(
    screen.getByRole(
      "button",
      {
        name: "Register",
      }
    )
  );
};


// ======================================
// Register
// ======================================
describe(
  "Register",
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
      "registers a user, creates the session, and redirects",
      async () => {
        const user = {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
          phone: "9876543210",
          isAdmin: false,
          isDoctor: false,
        };

        API.post.mockResolvedValueOnce({
          data: {
            success: true,
            message: "Registration successful",
            token: "registration-token",
            user,
          },
        });

        renderRegister();

        fillRegistrationForm();

        submitRegistrationForm();

        await waitFor(() => {
          expect(API.post).toHaveBeenCalledWith(
            "/auth/register",
            {
              name: "Test User",
              email: "test@example.com",
              phone: "9876543210",
              password: "password123",
            }
          );
        });

        expect(setSession).toHaveBeenCalledWith(
          "registration-token",
          user
        );

        expect(
          toast.success
        ).toHaveBeenCalledWith(
          "Registration successful"
        );

        expect(
          await screen.findByTestId("location")
        ).toHaveTextContent(
          "/user/dashboard"
        );
      }
    );


    test(
      "normalizes phone input to digits and limits it to ten characters",
      () => {
        renderRegister();

        const phoneInput =
          screen.getByPlaceholderText(
            "Enter the phone number"
          );

        fireEvent.change(
          phoneInput,
          {
            target: {
              name: "phone",
              value: "98a76-54321099",
            },
          }
        );

        expect(phoneInput).toHaveValue(
          "9876543210"
        );
      }
    );


    test(
      "shows duplicate account error and does not create a session",
      async () => {
        API.post.mockRejectedValueOnce({
          response: {
            status: 409,
            data: {
              success: false,
              message:
                "An account with this email already exists.",
            },
          },
        });

        renderRegister();

        fillRegistrationForm();

        submitRegistrationForm();

        await waitFor(() => {
          expect(
            toast.error
          ).toHaveBeenCalledWith(
            "An account with this email already exists."
          );
        });

        expect(
          setSession
        ).not.toHaveBeenCalled();

        expect(
          screen.getByRole(
            "button",
            {
              name: "Register",
            }
          )
        ).not.toBeDisabled();
      }
    );


    test(
      "shows fallback error when the server provides no message",
      async () => {
        API.post.mockRejectedValueOnce(
          new Error("Network failure")
        );

        renderRegister();

        fillRegistrationForm();

        submitRegistrationForm();

        await waitFor(() => {
          expect(
            toast.error
          ).toHaveBeenCalledWith(
            "Registration failed"
          );
        });

        expect(
          setSession
        ).not.toHaveBeenCalled();
      }
    );
  }
);
