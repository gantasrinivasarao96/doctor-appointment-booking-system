import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-toastify";

import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post(
        "/auth/login",
        formData
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      toast.success(
        data.message || "Login successful"
      );

      const redirectTo =
        location.state?.redirectTo;

      if (
        redirectTo &&
        !data.user.isAdmin &&
        !data.user.isDoctor
      ) {
        navigate(redirectTo, {
          replace: true,
        });
        return;
      }

      if (data.user.isAdmin) {
        navigate("/admin/dashboard", {
          replace: true,
        });
      } else if (data.user.isDoctor) {
        navigate("/doctor/dashboard", {
          replace: true,
        });
      } else {
        navigate("/user/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
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
                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Password
                    </label>

                    <div className="position-relative">
                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        className="form-control pe-5"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                      />

                      <span
                        className="material-icons position-absolute top-50 end-0 translate-middle-y me-3"
                        style={{
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onClick={() =>
                          setShowPassword(
                            (currentValue) =>
                              !currentValue
                          )
                        }
                      >
                        {showPassword
                          ? "visibility_off"
                          : "visibility"}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mb-3">
                    <Link to="/forgot-password">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading
                      ? "Logging in..."
                      : "Login"}
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
