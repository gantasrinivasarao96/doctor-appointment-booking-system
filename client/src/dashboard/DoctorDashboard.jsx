import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function DoctorDashboard() {
  return (
    <>
      <Navbar />

      <div className="container py-5">

        <div className="text-center mb-5">
          <h2 className="text-primary fw-bold">
            Doctor Dashboard
          </h2>

          <p className="text-muted">
            Welcome, Doctor
          </p>
        </div>

        <div className="row g-4">

          <div className="col-md-4">
            <div className="card shadow border-0 text-center">
              <div className="card-body">
                <h1 className="text-primary">0</h1>
                <h5>Total Appointments</h5>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow border-0 text-center">
              <div className="card-body">
                <h1 className="text-warning">0</h1>
                <h5>Pending</h5>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow border-0 text-center">
              <div className="card-body">
                <h1 className="text-success">0</h1>
                <h5>Approved</h5>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-5">
          <div className="alert alert-info text-center">
            Doctor appointments will appear here.
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}

export default DoctorDashboard;
