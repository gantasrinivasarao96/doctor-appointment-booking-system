import {
  Navigate,
  Outlet,
} from "react-router-dom";


// ======================================
// Safe Stored User Parser
// ======================================
const getStoredUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};


// ======================================
// Resolve User Dashboard
// ======================================
const getDashboardPath = (user) => {
  if (user?.isAdmin) {
    return "/admin/dashboard";
  }

  if (user?.isDoctor) {
    return "/doctor/dashboard";
  }

  return "/user/dashboard";
};


// ======================================
// Protected Route
//
// allowedRoles examples:
// ["user"]
// ["doctor"]
// ["admin"]
//
// No allowedRoles:
// any authenticated user
// ======================================
function ProtectedRoute({
  allowedRoles,
}) {
  const token =
    localStorage.getItem("token");

  const user =
    getStoredUser();


  if (!token || !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0
  ) {
    let currentRole = "user";

    if (user.isAdmin) {
      currentRole = "admin";
    } else if (user.isDoctor) {
      currentRole = "doctor";
    }


    if (
      !allowedRoles.includes(currentRole)
    ) {
      return (
        <Navigate
          to={getDashboardPath(user)}
          replace
        />
      );
    }
  }


  return <Outlet />;
}


export default ProtectedRoute;
