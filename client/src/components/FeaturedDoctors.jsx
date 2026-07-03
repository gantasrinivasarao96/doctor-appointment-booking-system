import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function FeaturedDoctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await API.get("/doctor/all");

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        setError("Failed to load doctors.");
      }
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "Server Error");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctorId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          redirectTo: `/book/${doctorId}`,
        },
      });
      return;
    }

    navigate(`/book/${doctorId}`);
  };

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold text-primary mb-5">
        Our Doctors
      </h2>

      {loading && (
        <div className="text-center">
          <h5>Loading doctors...</h5>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      )}

      {!loading && !error && doctors.length === 0 && (
        <div className="alert alert-warning text-center">
          No approved doctors found.
        </div>
      )}

      {!loading && !error && doctors.length > 0 && (
        <div className="row">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="col-12 col-sm-6 col-lg-4 mb-4"
            >
              <div className="card shadow-lg h-100 border-0 rounded-4">
                <div className="card-body d-flex flex-column">
                  <h4 className="card-title fw-bold">
                    {doctor.fullName}
                  </h4>

                  <p>
                    <strong>Specialization:</strong>{" "}
                    {doctor.specialization}
                  </p>

                  <p>
                    <strong>Experience:</strong>{" "}
                    {doctor.experience}
                  </p>

                  <p>
                    <strong>Consultation Fee:</strong> ₹
                    {doctor.fees}
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-100 mt-auto rounded-3"
                    onClick={() =>
                      handleBookAppointment(doctor._id)
                    }
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeaturedDoctors;
