import { Link } from "react-router-dom";

function About() {
  return (
    <main className="about-page">

      {/* HERO */}

      <section className="about-hero">
        <div className="about-container">
          <span className="about-eyebrow">
            About the Platform
          </span>

          <h1>
            Making Scholarship Opportunities
            Easier to Access
          </h1>

          <p>
            The Smart Scholarship Application and
            Management System provides one centralized
            platform for students, scholarship providers,
            and administrators.
          </p>
        </div>
      </section>

      {/* PURPOSE */}

      <section className="about-section">
        <div className="about-container">
          <div className="about-purpose-grid">

            <div className="about-purpose-content">
              <span className="about-section-label">
                Our Purpose
              </span>

              <h2>
                A simpler way to manage the
                scholarship process
              </h2>

              <p>
                Finding and applying for scholarships can
                involve many separate steps. This system
                brings scholarship discovery, eligibility
                checking, applications, document submission,
                and application tracking together in one
                place.
              </p>

              <p>
                Scholarship providers can publish and manage
                opportunities, review student applications,
                access submitted documents, and update
                application statuses through the same
                platform.
              </p>
            </div>

            <div className="about-purpose-card">
              <div className="about-purpose-icon">
                🎓
              </div>

              <h3>
                Smart Scholarship Management
              </h3>

              <p>
                Connecting students with scholarship
                opportunities while simplifying management
                for providers and administrators.
              </p>

              <div className="about-purpose-points">
                <span>✓ Centralized scholarship discovery</span>
                <span>✓ Eligibility checking</span>
                <span>✓ Online applications</span>
                <span>✓ Application status tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}

      <section className="about-features-section">
        <div className="about-container">

          <div className="about-section-heading">
            <span className="about-section-label">
              Platform Capabilities
            </span>

            <h2>
              Built for everyone involved
            </h2>

            <p>
              Different tools are provided for students,
              scholarship providers, and system
              administrators.
            </p>
          </div>

          <div className="about-feature-grid">

            <article className="about-feature-card">
              <div className="about-feature-icon">
                🎓
              </div>

              <h3>For Students</h3>

              <p>
                Discover scholarships and manage the complete
                application process from one account.
              </p>

              <ul>
                <li>Create an academic profile</li>
                <li>Search scholarship opportunities</li>
                <li>Check scholarship eligibility</li>
                <li>Submit applications and documents</li>
                <li>Track application status</li>
              </ul>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-icon">
                🏢
              </div>

              <h3>For Providers</h3>

              <p>
                Manage scholarship opportunities and review
                student applications efficiently.
              </p>

              <ul>
                <li>Create scholarship opportunities</li>
                <li>Edit and manage scholarships</li>
                <li>Review student applications</li>
                <li>View submitted documents</li>
                <li>Update application status</li>
              </ul>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-icon">
                ⚙️
              </div>

              <h3>For Administrators</h3>

              <p>
                Monitor the platform through a centralized
                administrative dashboard.
              </p>

              <ul>
                <li>Monitor registered users</li>
                <li>View system statistics</li>
                <li>Monitor scholarships</li>
                <li>Monitor applications</li>
                <li>Access management tools</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}

      <section className="about-section">
        <div className="about-container">
          <div className="about-tech-card">

            <div>
              <span className="about-section-label">
                Technology
              </span>

              <h2>
                Modern Web Application Architecture
              </h2>

              <p>
                The platform is built using a modern
                full-stack JavaScript architecture with
                separate frontend, backend, and database
                layers.
              </p>
            </div>

            <div className="about-tech-stack">
              <div>
                <span>Frontend</span>
                <strong>React.js</strong>
              </div>

              <div>
                <span>Backend</span>
                <strong>Node.js + Express.js</strong>
              </div>

              <div>
                <span>Database</span>
                <strong>MongoDB</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="about-cta">
        <div className="about-container">
          <div className="about-cta-content">
            <div>
              <h2>
                Explore Scholarship Opportunities
              </h2>

              <p>
                Browse available scholarships and discover
                opportunities that match your academic
                profile.
              </p>
            </div>

            <Link
              to="/scholarships"
              className="about-cta-button"
            >
              Browse Scholarships →
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

export default About;