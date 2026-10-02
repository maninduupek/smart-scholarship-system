import { Link } from "react-router-dom";

function Home() {
  const token =
    localStorage.getItem("token");

  let user = null;

  try {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(
        storedUser
      );
    }
  } catch (error) {
    console.error(
      "Failed to read user information."
    );
  }

  // ==========================================
  // ROLE-BASED PRIMARY ACTION
  // ==========================================

  const getPrimaryAction = () => {
    if (!token || !user) {
      return {
        path: "/register",
        label: "Get Started",
      };
    }

    if (user.role === "student") {
      return {
        path: "/scholarships",
        label: "Explore Scholarships",
      };
    }

    if (user.role === "provider") {
      return {
        path: "/my-scholarships",
        label: "Manage Scholarships",
      };
    }

    if (user.role === "admin") {
      return {
        path: "/admin",
        label: "Open Dashboard",
      };
    }

    return {
      path: "/",
      label: "Get Started",
    };
  };

  const primaryAction =
    getPrimaryAction();

  return (
    <main className="home-page">

      {/* ==================================
          HERO SECTION
          ================================== */}

      <section className="home-hero">
        <div className="home-container home-hero-grid">

          <div className="home-hero-content">
            <span className="home-eyebrow">
              Smart Scholarship Platform
            </span>

            <h1>
              Making scholarship
              opportunities{" "}
              <span>
                easier to discover.
              </span>
            </h1>

            <p className="home-hero-description">
              A centralized platform
              where students can discover
              scholarships, check their
              eligibility, submit
              applications and track their
              progress — while providers
              manage the entire scholarship
              process efficiently.
            </p>

            <div className="home-hero-actions">
              <Link
                to={
                  primaryAction.path
                }
                className="btn btn-primary home-primary-button"
              >
                {primaryAction.label}
                <span>→</span>
              </Link>

              {!token ? (
                <Link
                  to="/login"
                  className="btn home-outline-button"
                >
                  Sign In
                </Link>
              ) : (
                <Link
                  to="/about"
                  className="btn home-outline-button"
                >
                  Learn More
                </Link>
              )}
            </div>

            <div className="home-trust-row">
              <div>
                <span className="home-trust-icon">
                  ✓
                </span>
                Easy Applications
              </div>

              <div>
                <span className="home-trust-icon">
                  ✓
                </span>
                Eligibility Checking
              </div>

              <div>
                <span className="home-trust-icon">
                  ✓
                </span>
                Secure Documents
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}

          <div className="home-hero-visual">
            <div className="hero-dashboard-card">

              <div className="hero-dashboard-top">
                <div>
                  <span className="hero-small-label">
                    Scholarship Portal
                  </span>

                  <h3>
                    Your opportunities
                  </h3>
                </div>

                <div className="hero-dashboard-icon">
                  S
                </div>
              </div>

              <div className="hero-scholarship-card">
                <div className="hero-card-header">
                  <span className="hero-card-icon">
                    🎓
                  </span>

                  <span className="hero-status">
                    Open
                  </span>
                </div>

                <h4>
                  Academic Excellence
                  Scholarship
                </h4>

                <p>
                  Supporting students
                  with strong academic
                  performance.
                </p>

                <div className="hero-card-details">
                  <span>
                    GPA 3.0+
                  </span>

                  <span>
                    Active
                  </span>
                </div>
              </div>

              <div className="hero-progress-section">
                <div className="hero-progress-heading">
                  <span>
                    Application Progress
                  </span>

                  <strong>
                    75%
                  </strong>
                </div>

                <div className="hero-progress-track">
                  <div className="hero-progress-bar" />
                </div>
              </div>

              <div className="hero-mini-grid">
                <div className="hero-mini-card">
                  <strong>
                    Discover
                  </strong>

                  <span>
                    Opportunities
                  </span>
                </div>

                <div className="hero-mini-card">
                  <strong>
                    Apply
                  </strong>

                  <span>
                    Online
                  </span>
                </div>

                <div className="hero-mini-card">
                  <strong>
                    Track
                  </strong>

                  <span>
                    Progress
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-one">
              <span>
                ✓
              </span>

              <div>
                <strong>
                  Eligibility checked
                </strong>

                <small>
                  Ready to apply
                </small>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-two">
              <span>
                📄
              </span>

              <div>
                <strong>
                  Documents
                </strong>

                <small>
                  Securely uploaded
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================
          FEATURES SECTION
          ================================== */}

      <section className="home-section">
        <div className="home-container">

          <div className="home-section-header">
            <span className="home-section-eyebrow">
              Everything in one place
            </span>

            <h2>
              A simpler scholarship
              journey
            </h2>

            <p>
              From discovering an
              opportunity to receiving a
              final decision, the system
              keeps the scholarship
              process organized and easy
              to manage.
            </p>
          </div>

          <div className="home-feature-grid">

            <article className="home-feature-card">
              <div className="home-feature-icon">
                🔎
              </div>

              <h3>
                Find Scholarships
              </h3>

              <p>
                Browse available
                scholarships and use
                search and filters to
                quickly find suitable
                opportunities.
              </p>
            </article>

            <article className="home-feature-card">
              <div className="home-feature-icon">
                ✓
              </div>

              <h3>
                Check Eligibility
              </h3>

              <p>
                Compare your academic
                profile with scholarship
                criteria before
                submitting an
                application.
              </p>
            </article>

            <article className="home-feature-card">
              <div className="home-feature-icon">
                📄
              </div>

              <h3>
                Apply Online
              </h3>

              <p>
                Submit applications and
                securely upload the
                required supporting
                documents in one place.
              </p>
            </article>

            <article className="home-feature-card">
              <div className="home-feature-icon">
                📊
              </div>

              <h3>
                Track Progress
              </h3>

              <p>
                Follow application
                statuses including
                submitted, under review,
                selected and rejected.
              </p>
            </article>

          </div>
        </div>
      </section>

      {/* ==================================
          HOW IT WORKS
          ================================== */}

      <section className="home-section home-how-section">
        <div className="home-container">

          <div className="home-section-header">
            <span className="home-section-eyebrow">
              How it works
            </span>

            <h2>
              From profile to
              application
            </h2>

            <p>
              Students can complete the
              entire process through a
              simple four-step workflow.
            </p>
          </div>

          <div className="home-steps">

            <article className="home-step">
              <div className="home-step-number">
                01
              </div>

              <div>
                <h3>
                  Create your profile
                </h3>

                <p>
                  Add your university,
                  course, academic year
                  and GPA.
                </p>
              </div>
            </article>

            <article className="home-step">
              <div className="home-step-number">
                02
              </div>

              <div>
                <h3>
                  Explore opportunities
                </h3>

                <p>
                  Search available
                  scholarships that match
                  your interests.
                </p>
              </div>
            </article>

            <article className="home-step">
              <div className="home-step-number">
                03
              </div>

              <div>
                <h3>
                  Check & apply
                </h3>

                <p>
                  Check eligibility,
                  provide your statement
                  and upload documents.
                </p>
              </div>
            </article>

            <article className="home-step">
              <div className="home-step-number">
                04
              </div>

              <div>
                <h3>
                  Track your status
                </h3>

                <p>
                  Monitor the progress of
                  every submitted
                  application.
                </p>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* ==================================
          ROLE SECTION
          ================================== */}

      <section className="home-section">
        <div className="home-container">

          <div className="home-role-panel">
            <div className="home-role-intro">
              <span className="home-section-eyebrow">
                Built for everyone
              </span>

              <h2>
                One platform.
                <br />
                Three important roles.
              </h2>

              <p>
                Students, scholarship
                providers and system
                administrators each have
                dedicated tools designed
                for their responsibilities.
              </p>
            </div>

            <div className="home-role-list">

              <div className="home-role-item">
                <span className="home-role-icon">
                  🎓
                </span>

                <div>
                  <h3>
                    Students
                  </h3>

                  <p>
                    Discover, check,
                    apply and track.
                  </p>
                </div>
              </div>

              <div className="home-role-item">
                <span className="home-role-icon">
                  🏢
                </span>

                <div>
                  <h3>
                    Providers
                  </h3>

                  <p>
                    Publish scholarships
                    and review
                    applications.
                  </p>
                </div>
              </div>

              <div className="home-role-item">
                <span className="home-role-icon">
                  ⚙️
                </span>

                <div>
                  <h3>
                    Administrators
                  </h3>

                  <p>
                    Monitor and manage
                    the complete
                    platform.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ==================================
          CALL TO ACTION
          ================================== */}

      <section className="home-cta-section">
        <div className="home-container">
          <div className="home-cta">

            <div>
              <span className="home-cta-eyebrow">
                Smart Scholarship System
              </span>

              <h2>
                Ready to manage your
                scholarship journey?
              </h2>

              <p>
                Start exploring
                opportunities and keep
                everything organized in
                one place.
              </p>
            </div>

            <Link
              to={
                primaryAction.path
              }
              className="btn home-cta-button"
            >
              {primaryAction.label}
              <span>→</span>
            </Link>

          </div>
        </div>
      </section>

      {/* ==================================
          FOOTER
          ================================== */}

      <footer className="home-footer">
        <div className="home-container home-footer-content">
          <div>
            <strong>
              Smart Scholarship System
            </strong>

            <p>
              Scholarship Application
              and Management Platform
            </p>
          </div>

          <p>
            © {new Date().getFullYear()} Smart Scholarship System
          </p>
        </div>
      </footer>

    </main>
  );
}

export default Home;