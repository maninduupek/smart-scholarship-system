import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

function Navbar() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const token =
    localStorage.getItem(
      "token"
    );

  let user = null;

  try {
    const storedUser =
      localStorage.getItem(
        "user"
      );

    if (storedUser) {
      user =
        JSON.parse(
          storedUser
        );
    }
  } catch (error) {
    console.error(
      "Failed to read user information."
    );
  }

  // Close mobile menu whenever
  // the user changes page.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setMenuOpen(false);

    navigate(
      "/login"
    );

    window.location.reload();
  };

  return (
    <nav className="main-navbar">
      <div className="navbar-container">

        {/* =========================
            BRAND
            ========================= */}

        <Link
          to="/"
          className="navbar-brand"
        >
          <div className="brand-icon">
            S
          </div>

          <div className="brand-text">
            <span className="brand-title">
              Smart Scholarship
            </span>

            <span className="brand-subtitle">
              Application & Management
            </span>
          </div>
        </Link>

        {/* =========================
            MOBILE BUTTON
            ========================= */}

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMenuOpen(
              (previous) =>
                !previous
            )
          }
          aria-label="Toggle navigation menu"
          aria-expanded={
            menuOpen
          }
        >
          {menuOpen
            ? "✕"
            : "☰"}
        </button>

        {/* =========================
            NAVIGATION
            ========================= */}

        <div
          className={`navbar-links ${
            menuOpen
              ? "open"
              : ""
          }`}
        >
          <Link to="/">
            Home
          </Link>

          {/* =========================
              STUDENT
              ========================= */}

          {token &&
            user?.role ===
              "student" && (
              <>
                <Link to="/profile">
                  My Profile
                </Link>

                <Link to="/scholarships">
                  Scholarships
                </Link>

                <Link to="/my-applications">
                  My Applications
                </Link>
              </>
            )}

          {/* =========================
              PROVIDER
              ========================= */}

          {token &&
            user?.role ===
              "provider" && (
              <>
                <Link to="/scholarships">
                  Scholarships
                </Link>

                <Link to="/my-scholarships">
                  My Scholarships
                </Link>

                <Link to="/create-scholarship">
                  Create Scholarship
                </Link>

                <Link to="/provider-applications">
                  Applications
                </Link>
              </>
            )}

          {/* =========================
              ADMIN
              ========================= */}

          {token &&
            user?.role ===
              "admin" && (
              <>
                <Link to="/admin">
                  Dashboard
                </Link>

                <Link to="/admin/users">
                  Users
                </Link>

                <Link to="/scholarships">
                  Scholarships
                </Link>

                <Link to="/my-scholarships">
                  Manage Scholarships
                </Link>

                <Link to="/provider-applications">
                  Applications
                </Link>
              </>
            )}

          <Link to="/about">
            About
          </Link>

          {/* =========================
              GUEST
              ========================= */}

          {!token && (
            <>
              <Link
                to="/login"
                className="nav-login"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-register"
              >
                Register
              </Link>
            </>
          )}

          {/* =========================
              LOGGED-IN USER
              ========================= */}

          {token && (
            <div className="nav-user">
              <span className="nav-user-name">
                {user?.fullName}
              </span>

              <button
                type="button"
                className="nav-logout-button"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;