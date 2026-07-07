import {
  cleanup,
  render,
  screen,
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  useAuth,
} from "../../context/AuthContext";

import ProtectedRoute from "../ProtectedRoute";


vi.mock(
  "../../context/AuthContext",
  () => ({
    useAuth: vi.fn(),
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
// Test Router
// ======================================
const renderProtectedRoute = ({
  authState,
  allowedRoles,
  initialPath = "/protected",
}) => {
  useAuth.mockReturnValue(authState);

  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
    >
      <Routes>
        <Route
          element={
            <ProtectedRoute
              allowedRoles={allowedRoles}
            />
          }
        >
          <Route
            path="/protected"
            element={
              <div>Protected Content</div>
            }
          />
        </Route>

        <Route
          path="*"
          element={<LocationProbe />}
        />
      </Routes>
    </MemoryRouter>
  );
};


const createAuthState = ({
  user = null,
  loading = false,
  isAuthenticated = Boolean(user),
} = {}) => ({
  user,
  loading,
  isAuthenticated,
});


// ======================================
// Protected Route
// ======================================
describe(
  "ProtectedRoute",
  () => {
    afterEach(() => {
      cleanup();
      vi.clearAllMocks();
    });


    test(
      "shows session loading state",
      () => {
        renderProtectedRoute({
          authState: createAuthState({
            loading: true,
          }),
        });

        expect(
          screen.getByText(
            "Checking session..."
          )
        ).toBeInTheDocument();
      }
    );


    test(
      "redirects unauthenticated users to login",
      () => {
        renderProtectedRoute({
          authState: createAuthState(),
        });

        expect(
          screen.getByTestId("location")
        ).toHaveTextContent("/login");
      }
    );


    test(
      "allows authenticated users on unrestricted routes",
      () => {
        renderProtectedRoute({
          authState: createAuthState({
            user: {
              isAdmin: false,
              isDoctor: false,
            },
          }),
        });

        expect(
          screen.getByText(
            "Protected Content"
          )
        ).toBeInTheDocument();
      }
    );


    test(
      "allows a normal user on user-only routes",
      () => {
        renderProtectedRoute({
          authState: createAuthState({
            user: {
              isAdmin: false,
              isDoctor: false,
            },
          }),
          allowedRoles: ["user"],
        });

        expect(
          screen.getByText(
            "Protected Content"
          )
        ).toBeInTheDocument();
      }
    );


    test(
      "allows a doctor on doctor-only routes",
      () => {
        renderProtectedRoute({
          authState: createAuthState({
            user: {
              isAdmin: false,
              isDoctor: true,
            },
          }),
          allowedRoles: ["doctor"],
        });

        expect(
          screen.getByText(
            "Protected Content"
          )
        ).toBeInTheDocument();
      }
    );


    test(
      "allows an admin on admin-only routes",
      () => {
        renderProtectedRoute({
          authState: createAuthState({
            user: {
              isAdmin: true,
              isDoctor: false,
            },
          }),
          allowedRoles: ["admin"],
        });

        expect(
          screen.getByText(
            "Protected Content"
          )
        ).toBeInTheDocument();
      }
    );


    test.each([
      [
        "user",
        {
          isAdmin: false,
          isDoctor: false,
        },
        "/user/dashboard",
      ],
      [
        "doctor",
        {
          isAdmin: false,
          isDoctor: true,
        },
        "/doctor/dashboard",
      ],
      [
        "admin",
        {
          isAdmin: true,
          isDoctor: false,
        },
        "/admin/dashboard",
      ],
    ])(
      "redirects unauthorized %s role to its dashboard",
      (
        _role,
        user,
        expectedPath
      ) => {
        renderProtectedRoute({
          authState: createAuthState({
            user,
          }),
          allowedRoles: ["blocked-role"],
        });

        expect(
          screen.getByTestId("location")
        ).toHaveTextContent(expectedPath);
      }
    );
  }
);
