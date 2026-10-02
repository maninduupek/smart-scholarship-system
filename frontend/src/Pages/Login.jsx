import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setError("");
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "http://localhost:5000/api/users/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Login failed."
        );

        return;
      }

      // ======================================
      // SAVE LOGIN INFORMATION
      // ======================================

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user
        )
      );

      // ======================================
      // ROLE-BASED REDIRECTION
      // ======================================

      if (
        data.user.role ===
        "admin"
      ) {
        navigate("/admin");
      } else if (
        data.user.role ===
        "provider"
      ) {
        navigate(
          "/my-scholarships"
        );
      } else {
        navigate(
          "/scholarships"
        );
      }

      // Refresh so Navbar immediately
      // receives the new login state.
      window.location.reload();
    } catch (error) {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-wrapper">

        {/* ==================================
            LEFT INFORMATION AREA
            ================================== */}

        <section className="auth-info">
          <div className="auth-info-content">
            <span className="auth-eyebrow">
              Smart Scholarship System
            </span>

            <h1>
              Find opportunities.
              <br />
              Build your future.
            </h1>

            <p>
              Access scholarships,
              manage your applications,
              and track your progress
              through one centralized
              platform.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span className="auth-feature-icon">
                  ✓
                </span>

                <div>
                  <strong>
                    Discover Scholarships
                  </strong>

                  <p>
                    Search and explore
                    available opportunities.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  ✓
                </span>

                <div>
                  <strong>
                    Check Eligibility
                  </strong>

                  <p>
                    Quickly see whether
                    you meet scholarship
                    requirements.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  ✓
                </span>

                <div>
                  <strong>
                    Track Applications
                  </strong>

                  <p>
                    Follow your
                    application status
                    from submission to
                    final decision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================
            LOGIN CARD
            ================================== */}

        <section className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-icon">
              S
            </div>

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to continue to
              your scholarship account.
            </p>
          </div>

          {error && (
            <div
              className="alert alert-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="auth-form"
          >
            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                autoComplete="email"
                disabled={
                  loading
                }
              />
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-field">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="current-password"
                  disabled={
                    loading
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={
                    loading
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="btn btn-primary auth-submit-button"
              disabled={
                loading
              }
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>
              New to Smart Scholarship?
            </span>
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>

          <div className="auth-security-note">
            <span>🔒</span>

            <p>
              Your account information
              is securely protected.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;