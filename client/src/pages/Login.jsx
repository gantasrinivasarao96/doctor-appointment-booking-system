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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await API.post("/auth/login", formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(data.message);

      if (data.user.isAdmin) {
        navigate("/admin/dashboard");
      } else if (data.user.isDoctor) {
        navigate("/doctor/dashboard");
      } else {
        navigate("/user/dashboard");
      }                                                               } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container py-5">                                    <div className="row justify-content-center">

          <div className="col-md-6">

            <div className="card shadow-lg border-0 rounded-4">

              <div className="card-body p-4">

                <h2 className="text-center text-primary mb-4">
                  Login
                </h2>
                                                                                  <form onSubmit={handleSubmit}>

                  <div className="mb-3">
                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Enter your email"                                    value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Password                                                        </label>

                    <div className="position-relative">
                                                                                        <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control pe-5"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />

                      <span
                        className="material-icons position-absolute top-50 end-0 translate-middle-y me-3"
                        style={{
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        {showPassword
                          ? "visibility_off"
                          : "visibility"}
                      </span>

                    </div>
                  </div>

                  <div className="d-flex justify-content-end mb-3">

                    <Link to="/forgot-password">                                        Forgot Password?                                                </Link>

                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
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
