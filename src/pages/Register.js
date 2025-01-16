import React, { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LoadingContext } from "../App";
import api from "../api/api";
import Swal from "sweetalert2";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isPrivate, setIsPrivate] = useState(0); // Default 0 untuk public
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const { setLoading } = useContext(LoadingContext);
  const navigate = useNavigate();

  // Cek apakah pengguna sudah login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const username = localStorage.getItem("username");
      navigate(`/profile/${username}`);
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    setLoading(true);

    try {
      await api.post("/v1/auth/register", {
        full_name: fullName,
        username,
        password,
        bio,
        is_private: isPrivate,
      });

      Swal.fire({
        title: "Registration Successful",
        text: "Your account has been registered successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/login"); // Arahkan ke halaman login setelah klik OK
      });
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Registration failed.");
        setValidationErrors(err.response.data.errors || {});
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center flex-wrap align-content-start mt-5 vh-100">
      <div className="social-background"></div>
      <div className="bg-white p-4 rounded shadow-lg register-container">
        <h2 className="text-center mb-4">Register</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            {validationErrors.full_name && (
              <div className="text-danger">
                {validationErrors.full_name.join(", ")}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {validationErrors.username && (
              <div className="text-danger">
                {validationErrors.username.join(", ")}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {validationErrors.password && (
              <div className="text-danger">
                {validationErrors.password.join(", ")}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <textarea
              className="form-control"
              id="bio"
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
            {validationErrors.bio && (
              <div className="text-danger">
                {validationErrors.bio.join(", ")}
              </div>
            )}
          </div>
          <div className="mb-3 form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              id="isPrivate"
              checked={isPrivate === 1}
              onChange={(e) => setIsPrivate(e.target.checked ? 1 : 0)}
            />
            <label htmlFor="isPrivate" className="form-check-label">
              Private Account
            </label>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
        <p className="mt-3 text-center">
          Already have an account? <NavLink to="/login">Login</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Register;
