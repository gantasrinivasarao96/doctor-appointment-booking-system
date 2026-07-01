import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
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
      const { data } = await API.post("/auth/register", formData);

      alert(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/user/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message || "Registration Failed"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="container py-5">
        <div className="row justify-content-center">

          <div className="col-md-6">

            <div className="card shadow-lg border-0 rounded-4">

              <div className="card-body p-4">

                <h2 className="text-center text-primary mb-4">
                  Register
                </h2>

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">
                    <label>Name</label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label>Email</label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label>Phone</label>

                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label>Password</label>

                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    className="btn btn-primary w-100"
                    type="submit"
                  >
                    Register
                  </button>

                </form>

                <p className="text-center mt-3">
                  Already have an account?{" "}
                  <Link to="/login">
                    Login
                  </Link>
                </p>

              </div>

            </div>

          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

export default Register;
