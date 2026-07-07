import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


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
// ======================================
function ProtectedRoute({
  allowedRoles,
}) {
  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();


  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h5>Checking session...</h5>
      </div>
    );
  }


  if (!isAuthenticated) {
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
