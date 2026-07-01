import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function ApplyDoctor() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    specialization: "",
    experience: "",
    fees: "",
    address: "",
    timings: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const { data } = await API.post(
        "/doctor/apply",
        {
          ...formData,
          userId: JSON.parse(localStorage.getItem("user"))._id,
          timings: formData.timings.split(","),
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
  console.log(error.response);

  alert(
    JSON.stringify(error.response?.data)
  );
}
  };

  return (
    <>
      <Navbar />

      <div className="container py-5">

        <div className="row justify-content-center">

          <div className="col-lg-8">

            <div className="card shadow border-0 rounded-4">

              <div className="card-body p-4">

                <h2 className="text-center text-primary mb-4">
                  Apply as Doctor
                </h2>

                <form onSubmit={handleSubmit}>

                  <input
                    className="form-control mb-3"
                    name="fullName"
                    placeholder="Full Name"
                    onChange={handleChange}
                    required
                  />

                  <input
                    className="form-control mb-3"
                    name="phone"
                    placeholder="Phone"
                    onChange={handleChange}
                    required
                  />

                  <input
                    className="form-control mb-3"
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                  />

                  <input
                    className="form-control mb-3"
                    name="specialization"
                    placeholder="Specialization"
                    onChange={handleChange}
                    required
                  />

                  <input
                    className="form-control mb-3"
                    name="experience"
                    placeholder="Experience"
                    onChange={handleChange}
                    required
                  />

                  <input
                    className="form-control mb-3"
                    type="number"
                    name="fees"
                    placeholder="Consultation Fee"
                    onChange={handleChange}
                    required
                  />

                  <textarea
                    className="form-control mb-3"
                    name="address"
                    placeholder="Clinic Address"
                    onChange={handleChange}
                    required
                  />

                  <input
                    className="form-control mb-4"
                    name="timings"
                    placeholder="09:00 AM,05:00 PM"
                    onChange={handleChange}
                    required
                  />

                  <button
                    className="btn btn-primary w-100"
                    type="submit"
                  >
                    Submit Application
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

export default ApplyDoctor;
