import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function BookAppointment() {
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [medicalDocument, setMedicalDocument] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const { data } = await API.post(
        "/appointment/book",
        {
          doctorId,
          appointmentDate,
          appointmentTime,
          medicalDocument: "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(data.message);

      navigate("/user/dashboard");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to book appointment"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4">

                <h2 className="text-center text-primary fw-bold mb-4">
                  Book Appointment
                </h2>

                <h4>Dr. Srinivasa Rao</h4>

                <p>
                  <strong>Specialization:</strong> General Physician
                </p>

                <p>
                  <strong>Consultation Fee:</strong> ₹500
                </p>

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">
                    <label className="form-label">
                      Appointment Date
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={appointmentDate}
                      onChange={(e) =>
                        setAppointmentDate(e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Appointment Time
                    </label>

                    <input
                      type="time"
                      className="form-control"
                      value={appointmentTime}
                      onChange={(e) =>
                        setAppointmentTime(e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Medical Report (Optional)
                    </label>

                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        setMedicalDocument(e.target.files[0])
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                  >
                    Confirm Appointment
                  </button>

                </form>

              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default BookAppointment;
