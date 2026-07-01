import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function MyAppointments() {

  // Stores all appointments received from the backend
  const [appointments, setAppointments] = useState([]);

  // Used to show Loading... until the API finishes
  const [loading, setLoading] = useState(true);

  // Runs automatically when this page opens
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch appointments from backend
  const fetchAppointments = async () => {
    try {

      // Read JWT token saved during login
      const token = localStorage.getItem("token");

      // Call backend API
      const { data } = await API.get("/appointment/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If backend returns success
      if (data.success) {
        setAppointments(data.appointments);
      }

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to load appointments"
      );

    } finally {

      // Stop loading
      setLoading(false);

    }
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="container py-5">

        {/* Page Heading */}
        <h2 className="text-center text-primary fw-bold mb-4">
          My Appointments
        </h2>

        {/* Loading Screen */}
        {loading ? (

          <h5 className="text-center">
            Loading...
          </h5>

        ) : appointments.length === 0 ? (

          // No appointments found
          <div className="alert alert-warning text-center">
            No appointments found.
          </div>

        ) : (

          // Display all appointments
          <div className="row">

            {appointments.map((appointment) => (

              <div
                className="col-md-6 col-lg-4 mb-4"
                key={appointment._id}
              >

                <div className="card shadow border-0 rounded-4 h-100">

                  <div className="card-body">

                    {/* Doctor Name */}
                    <h4 className="text-primary">
                      {appointment.doctorId?.fullName}
                    </h4>

                    {/* Doctor Specialization */}
                    <p>
                      <strong>Specialization:</strong>{" "}
                      {appointment.doctorId?.specialization}
                    </p>

                    {/* Appointment Date */}
                    <p>
                      <strong>Date:</strong>{" "}
                      {appointment.appointmentDate}
                    </p>

                    {/* Appointment Time */}
                    <p>
                      <strong>Time:</strong>{" "}
                      {new Date(
                        `1970-01-01T${appointment.appointmentTime}`
                      ).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>

                    {/* Appointment Status */}
                    <p>
                      <strong>Status:</strong>{" "}

                      <span
                        className={
                          appointment.status === "Approved"
                            ? "text-success fw-bold"
                            : appointment.status === "Rejected"
                            ? "text-danger fw-bold"
                            : "text-warning fw-bold"
                        }
                      >
                        {appointment.status}
                      </span>

                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default MyAppointments;
