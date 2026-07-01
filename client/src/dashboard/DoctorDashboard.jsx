import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await API.get("/appointment/doctor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await API.put(
        `/appointment/update/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(data.message);

      fetchAppointments();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to update appointment"
      );
    }
  };

  const pending = appointments.filter(
    (a) => a.status === "Pending"
  ).length;

  const approved = appointments.filter(
    (a) => a.status === "Approved"
  ).length;

  return (
    <>
      <Navbar />

      <div className="container py-5">

        <div className="text-center mb-5">
          <h2 className="text-primary fw-bold">
            Doctor Dashboard
          </h2>

          <p className="text-muted">
            Welcome, Doctor
          </p>
        </div>

        <div className="row g-4 mb-5">

          <div className="col-md-4">
            <div className="card shadow border-0 text-center">
              <div className="card-body">
                <h1 className="text-primary fw-bold">
                  {appointments.length}
                </h1>
                <h5>Total Appointments</h5>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow border-0 text-center">
              <div className="card-body">
                <h1 className="text-warning fw-bold">
                  {pending}
                </h1>
                <h5>Pending</h5>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow border-0 text-center">
              <div className="card-body">
                <h1 className="text-success fw-bold">
                  {approved}
                </h1>
                <h5>Approved</h5>
              </div>
            </div>
          </div>

        </div>

        {loading ? (

          <h4 className="text-center">
            Loading...
          </h4>

        ) : appointments.length === 0 ? (

          <div className="alert alert-warning text-center">
            No appointments found.
          </div>

        ) : (

          <div className="row">

            {appointments.map((appointment) => (

              <div
                className="col-lg-6 mb-4"
                key={appointment._id}
              >

                <div className="card shadow border-0 rounded-4 h-100">

                  <div className="card-body">

                    <h4 className="text-primary fw-bold">
                      {appointment.userId?.name}
                    </h4>

                    <p>
                      <strong>Email:</strong>{" "}
                      {appointment.userId?.email}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {appointment.appointmentDate}
                    </p>

                    <p>
                      <strong>Time:</strong>{" "}
                      {appointment.appointmentTime}
                    </p>

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

                    {appointment.status === "Pending" && (

                      <div className="d-flex gap-2 mt-3">

                        <button
                          className="btn btn-success"
                          onClick={() =>
                            updateStatus(
                              appointment._id,
                              "Approved"
                            )
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            updateStatus(
                              appointment._id,
                              "Rejected"
                            )
                          }
                        >
                          Reject
                        </button>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      <Footer />
    </>
  );
}

export default DoctorDashboard;
