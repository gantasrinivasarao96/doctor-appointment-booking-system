import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";

import UserDashboard from "./dashboard/UserDashboard";
import DoctorDashboard from "./dashboard/DoctorDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Appointment Routes */}
        <Route path="/book/:doctorId" element={<BookAppointment />} />
        <Route path="/my-appointments" element={<MyAppointments />} />

        {/* Dashboard Routes */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
