import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPendingDoctors = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await API.get(
        "/admin/doctors/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load doctor applications"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingDoctors();
  }, [fetchPendingDoctors]);

  const approveDoctor = async (id) => {
    if (updatingId) {
      return;
    }

    setUpdatingId(id);

    try {
      const token = localStorage.getItem("token");

      const { data } = await API.put(
        `/admin/doctors/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        data.message || "Doctor approved successfully"
      );

      await fetchPendingDoctors();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Approval failed"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const rejectDoctor = async (id) => {
    if (updatingId) {
      return;
    }

    setUpdatingId(id);

    try {
      const token = localStorage.getItem("token");

      const { data } = await API.put(
        `/admin/doctors/reject/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        data.message || "Doctor application rejected"
      );

      await fetchPendingDoctors();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Rejection failed"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <main className="container py-5">
        <div className="text-center mb-5">
          <h2 className="text-primary fw-bold">
            Admin Dashboard
          </h2>

          <p className="text-muted">
            Manage Doctor Applications
          </p>
        </div>

        <div className="row mb-4">
          <div className="col-md-4 mx-auto">
            <div className="card shadow border-0 text-center">
              <div className="card-body">
                <h1 className="text-primary fw-bold">
                  {doctors.length}
                </h1>

                <h5>Pending Applications</h5>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <h4>Loading applications...</h4>
          </div>
        ) : doctors.length === 0 ? (
          <div className="alert alert-success text-center">
            No pending doctor applications.
          </div>
        ) : (
          <div className="row">
            {doctors.map((doctor) => {
              const isUpdating =
                updatingId === doctor._id;

              return (
                <div
                  className="col-lg-6 mb-4"
                  key={doctor._id}
                >
                  <div className="card shadow border-0 rounded-4 h-100">
                    <div className="card-body">
                      <h4 className="text-primary fw-bold">
                        {doctor.fullName}
                      </h4>

                      <p>
                        <strong>Email:</strong>{" "}
                        {doctor.email}
                      </p>

                      <p>
                        <strong>Phone:</strong>{" "}
                        {doctor.phone}
                      </p>

                      <p>
                        <strong>
                          Specialization:
                        </strong>{" "}
                        {doctor.specialization}
                      </p>

                      <p>
                        <strong>Experience:</strong>{" "}
                        {doctor.experience}
                      </p>

                      <p>
                        <strong>
                          Consultation Fee:
                        </strong>{" "}
                        ₹{doctor.fees}
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}

                        <span className="text-warning fw-bold">
                          {doctor.status}
                        </span>
                      </p>

                      <div className="d-flex gap-2 mt-3">
                        <button
                          type="button"
                          className="btn btn-success w-100"
                          disabled={isUpdating}
                          onClick={() =>
                            approveDoctor(doctor._id)
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger w-100"
                          disabled={isUpdating}
                          onClick={() =>
                            rejectDoctor(doctor._id)
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : "Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default AdminDashboard;
