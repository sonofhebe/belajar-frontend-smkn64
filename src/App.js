import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState, createContext } from "react";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NewPost from "./pages/NewPost";
import Profile from "./pages/Profile";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Style.css";

// Context for managing global loading state
export const LoadingContext = createContext();

// Loader component
const Loader = () => (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-flex justify-content-center align-items-center"
    style={{ zIndex: 1050 }}
  >
    <div className="spinner-border text-light" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Protected route component to ensure only authenticated users can access
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // Global loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Check if a token exists
  }, []);

  console.log(localStorage.getItem("username"));

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      <div className="root">
        {/* <Router> */}
        <Router basename="/FRONTEND">
          <Navbar />
          {loading && <Loader />}
          <div className="d-flex justify-content-center">
            <Routes>
              {/* Route for login page */}
              <Route path="/login" element={<Login />} />

              {/* Route for register page */}
              <Route path="/register" element={<Register />} />

              {/* Default route redirects based on authentication */}
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/home" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* Home page only accessible if logged in */}
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />

              {/* New post page only accessible if logged in */}
              <Route
                path="/new-post"
                element={
                  <PrivateRoute>
                    <NewPost />
                  </PrivateRoute>
                }
              />

              {/* Profile page only accessible if logged in */}
              <Route
                path="/profile/:username"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </div>
    </LoadingContext.Provider>
  );
};

export default App;
