import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/api";
import { LoadingContext } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const { setLoading } = useContext(LoadingContext); // Gunakan context untuk loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Tampilkan loader

    try {
      const response = await api.post("v1/auth/login", {
        username,
        password,
      });
      localStorage.setItem("username", username); // Simpan token
      localStorage.setItem("token", response.data.token); // Simpan token
      navigate("/home"); // Arahkan ke dashboard
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Login failed.");
        setValidationErrors(err.response.data.errors || {});
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Sembunyikan loader
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center flex-wrap align-content-start mt-5 vh-100">
      <div className="social-background"></div>
      <div className="bg-white p-5 rounded shadow-lg login-container">
        <h2 className="text-center mb-4">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
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
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        <p className="mt-3 text-center">
          Don't have an account? <NavLink to="/register">Register</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
