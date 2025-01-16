import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../css/Style.css";
import Swal from "sweetalert2";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location/path

  // Dynamically set the page title based on the current route
  const getTitlePage = () => {
    if (location.pathname === "/" || location.pathname === "/home") {
      return <strong className="navbar-title">Home</strong>;
    } else if (location.pathname.startsWith("/new-post")) {
      return <strong className="navbar-title">New Post</strong>;
    } else if (location.pathname.startsWith("/profile")) {
      return <strong className="navbar-title">Profile</strong>;
    } else {
      return;
    }
  };

  // Fungsi Logout
  const handleLogout = async () => {
    // Display a SweetAlert confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log me out!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      if (token && username) {
        try {
          const response = await fetch("/api/v1/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log(data.message); // Optional: Log the success message
          } else {
            const error = await response.json();
            console.error(error.message); // Optional: Log error details
          }
        } catch (error) {
          console.error("Logout request failed:", error);
        }
      }

      // Clear local storage and redirect regardless of API response
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      Swal.fire("Logged out!", "You have been logged out.", "success");
      navigate("/login");
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light"
      style={{ backgroundColor: "rgb(205 234 255)" }}
    >
      <div className="container-fluid px-5">
        <NavLink className="navbar-brand" to="/">
          <i className="fas fa-grin-beam"></i> Facegram
        </NavLink>
        {token && (
          <>
            {getTitlePage()}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to={`/profile/${localStorage.getItem("username")}`}
                    activeclassname="active-link"
                  >
                    <strong>{localStorage.getItem("username")}</strong>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <span className="nav-link text-danger" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                  </span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
