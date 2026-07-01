import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
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
      const { data } = await API.post("/auth/login", formData);

      alert(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.isAdmin) {
        navigate("/admin/dashboard");
      } else if (data.user.isDoctor) {
        navigate("/doctor/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
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
                  Login
                </h2>

                <form onSubmit={handleSubmit}>

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

                  <div className="mb-4">
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
                    type="submit"
                    className="btn btn-primary w-100"
                  >
                    Login
                  </button>

                </form>

                <p className="text-center mt-3">
                  Don't have an account?{" "}
                  <Link to="/register">
                    Register
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

export default Login;
