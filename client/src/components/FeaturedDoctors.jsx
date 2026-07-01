import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function FeaturedDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      console.log("Fetching doctors...");

      const { data } = await API.get("/doctor/all");

      console.log("API Response:", data);

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        setError("Failed to load doctors.");
      }
    } catch (err) {
      console.error("API Error:", err);

      if (err.response) {
        console.log("Response:", err.response.data);
        setError(err.response.data.message || "Server Error");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
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

      {error && (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      )}

      {!loading && !error && doctors.length === 0 && (
        <div className="alert alert-warning text-center">
          No approved doctors found.
        </div>
      )}

      <div className="row">
        {doctors.map((doctor) => (
          <div
            className="col-12 col-sm-6 col-lg-4 mb-4"
            key={doctor._id}
          >
            <div className="card shadow-lg h-100 border-0 rounded-4">
              <div className="card-body">
                <h4 className="card-title">{doctor.fullName}</h4>

                <p>
                  <strong>Specialization:</strong>{" "}
                  {doctor.specialization}
                </p>

                <p>
                  <strong>Experience:</strong>{" "}
                  {doctor.experience}
                </p>

                <p>
                  <strong>Consultation Fee:</strong> ₹{doctor.fees}
                </p>

                <Link
                  to={`/book/${doctor._id}`}
                  className="btn btn-primary btn-lg w-100 rounded-3"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturedDoctors;
