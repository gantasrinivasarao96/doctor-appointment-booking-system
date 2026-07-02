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

  const total = appointments.length;

  const pending = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  const approved = appointments.filter(
    (appointment) => appointment.status === "Approved"
  ).length;

  const completed = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

  const rejected = appointments.filter(
    (appointment) => appointment.status === "Rejected"
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
            Manage your appointments efficiently
          </p>
        </div>

        <div className="row g-4 mb-5">

          <div className="col-lg col-md-4 col-sm-6">
            <div className="card shadow border-0 text-center h-100">
              <div className="card-body">
                <h1 className="text-primary fw-bold">
                  {total}
                </h1>
                <h5>Total</h5>
              </div>
            </div>
          </div>

          <div className="col-lg col-md-4 col-sm-6">
            <div className="card shadow border-0 text-center h-100">
              <div className="card-body">
                <h1 className="text-warning fw-bold">
                  {pending}
                </h1>
                <h5>Pending</h5>
              </div>
            </div>
          </div>

          <div className="col-lg col-md-4 col-sm-6">
            <div className="card shadow border-0 text-center h-100">
              <div className="card-body">
                <h1 className="text-success fw-bold">
                  {approved}
                </h1>
                <h5>Approved</h5>
              </div>
            </div>
          </div>

          <div className="col-lg col-md-4 col-sm-6">
            <div className="card shadow border-0 text-center h-100">
              <div className="card-body">
                <h1 className="text-info fw-bold">
                  {completed}
                </h1>
                <h5>Completed</h5>
              </div>
            </div>
          </div>

          <div className="col-lg col-md-4 col-sm-6">
            <div className="card shadow border-0 text-center h-100">
              <div className="card-body">
                <h1 className="text-danger fw-bold">
                  {rejected}
                </h1>
                <h5>Rejected</h5>
              </div>
            </div>
          </div>
        </div>

        {loading ? (

          <div className="text-center py-5">
            <h4>Loading appointments...</h4>
          </div>

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
                      👤 {appointment.userId?.name}
                    </h4>

                    <hr />

                    <p>
                      <strong>Email:</strong>{" "}
                      {appointment.userId?.email}
                    </p>

                    <p>
                      <strong>Appointment Date:</strong>{" "}
                      {appointment.appointmentDate}
                    </p>

                    <p>
                      <strong>Appointment Time:</strong>{" "}
                      {appointment.appointmentTime}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}

                      <span
                        className={
                          appointment.status === "Approved"
                            ? "badge bg-success"
                            : appointment.status === "Rejected"
                            ? "badge bg-danger"
                            : appointment.status === "Completed"
                            ? "badge bg-info"
                            : "badge bg-warning text-dark"
                        }
                      >
                        {appointment.status}
                      </span>

                    </p>

                    {appointment.status === "Pending" && (

                      <div className="d-flex gap-2 mt-3">

                        <button
                          className="btn btn-success flex-fill"
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
                          className="btn btn-danger flex-fill"
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

                    {appointment.status === "Approved" && (

                      <div className="mt-3">

                        <button
                          className="btn btn-info w-100"
                          onClick={() =>
                            updateStatus(
                              appointment._id,
                              "Completed"
                            )
                          }
                        >
                          ✔ Mark as Completed
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
