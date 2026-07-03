import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeaturedDoctors from "../components/FeaturedDoctors";

function Doctors() {
  return (
    <>
      <Navbar />

      <main>
        <FeaturedDoctors />
      </main>

      <Footer />
    </>
  );
}

export default Doctors;
