import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
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
    setMessage("");
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const fullName =
      formData.fullName.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;

    // ======================================
    // FRONTEND VALIDATION
    // ======================================

    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please complete all fields."
      );

      return;
    }

    if (
      fullName.length < 2
    ) {
      setError(
        "Please enter a valid full name."
      );

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(email)
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    if (
      password.length < 6
    ) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "http://localhost:5000/api/users/register",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              fullName,
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
            "Registration failed."
        );

        return;
      }

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
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
            INFORMATION AREA
            ================================== */}

        <section className="auth-info">
          <div className="auth-info-content">
            <span className="auth-eyebrow">
              Start Your Journey
            </span>

            <h1>
              Scholarships made
              simpler.
            </h1>

            <p>
              Create your student
              account and manage your
              scholarship journey from
              one convenient platform.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span className="auth-feature-icon">
                  1
                </span>

                <div>
                  <strong>
                    Create Your Profile
                  </strong>

                  <p>
                    Add your academic
                    information once and
                    keep it updated.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  2
                </span>

                <div>
                  <strong>
                    Find Scholarships
                  </strong>

                  <p>
                    Search opportunities
                    and check your
                    eligibility.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  3
                </span>

                <div>
                  <strong>
                    Apply & Track
                  </strong>

                  <p>
                    Submit documents and
                    follow your
                    application status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================
            REGISTER CARD
            ================================== */}

        <section className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-icon">
              S
            </div>

            <h2>
              Create Account
            </h2>

            <p>
              Register as a student to
              start applying for
              scholarships.
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

          {message && (
            <div
              className="alert alert-success"
              role="status"
            >
              {message}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="auth-form"
          >
            {/* FULL NAME */}

            <div className="form-group">
              <label htmlFor="fullName">
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={
                  formData.fullName
                }
                onChange={
                  handleChange
                }
                autoComplete="name"
                disabled={
                  loading
                }
              />
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="registerEmail">
                Email Address
              </label>

              <input
                id="registerEmail"
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
              <label htmlFor="registerPassword">
                Password
              </label>

              <div className="password-field">
                <input
                  id="registerPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="new-password"
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
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="password-field">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Enter password again"
                  value={
                    formData.confirmPassword
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="new-password"
                  disabled={
                    loading
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={
                    loading
                  }
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            <p className="password-hint">
              Password must contain at
              least 6 characters.
            </p>

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="btn btn-primary auth-submit-button"
              disabled={
                loading
              }
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>
              Already registered?
            </span>
          </div>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>

          <div className="auth-security-note">
            <span>🔒</span>

            <p>
              Registration creates a
              secure student account.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;