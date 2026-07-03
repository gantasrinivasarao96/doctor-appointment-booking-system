import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import ApplyDoctor from "./pages/ApplyDoctor";

import UserDashboard from "./dashboard/UserDashboard";
import DoctorDashboard from "./dashboard/DoctorDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/doctors"
            element={<Doctors />}
          />

          <Route
            path="/book/:doctorId"
            element={<BookAppointment />}
          />

          <Route
            path="/my-appointments"
            element={<MyAppointments />}
          />

          <Route
            path="/apply-doctor"
            element={<ApplyDoctor />}
          />

          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />

          <Route
            path="/doctor/dashboard"
            element={<DoctorDashboard />}
          />

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>
      </Routes>

      {/* Global Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;
