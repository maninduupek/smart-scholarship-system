import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyApplications() {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD APPLICATIONS
  // ==========================================

  useEffect(() => {
    const fetchApplications = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login to view your applications."
        );

        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/applications/my",
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to load applications."
          );

          return;
        }

        setApplications(
          data.applications || []
        );
      } catch (error) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // ==========================================
  // FORMAT AMOUNT
  // ==========================================

  const formatAmount = (amount) => {
    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return "Not available";
    }

    const numericAmount =
      Number(amount);

    if (
      Number.isNaN(numericAmount)
    ) {
      return amount;
    }

    return numericAmount.toLocaleString(
      "en-LK"
    );
  };

  // ==========================================
  // STATUS HELPERS
  // ==========================================

  const getStatusClass = (status) => {
    switch (
      status?.toLowerCase()
    ) {
      case "selected":
        return "application-status-selected";

      case "rejected":
        return "application-status-rejected";

      case "under review":
        return "application-status-review";

      case "submitted":
      default:
        return "application-status-submitted";
    }
  };

  const getStatusIcon = (status) => {
    switch (
      status?.toLowerCase()
    ) {
      case "selected":
        return "✓";

      case "rejected":
        return "×";

      case "under review":
        return "◷";

      case "submitted":
      default:
        return "✓";
    }
  };

  const getStatusDescription = (
    status
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case "selected":
        return "Congratulations! Your application has been selected.";

      case "rejected":
        return "This application was not selected.";

      case "under review":
        return "The scholarship provider is currently reviewing your application.";

      case "submitted":
      default:
        return "Your application has been successfully submitted.";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="student-page">
        <div className="student-container">
          <div className="student-loading-card">
            <div className="student-spinner" />

            <h2>
              Loading your applications
            </h2>

            <p>
              Retrieving your scholarship
              application history...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="student-page">
        <div className="student-container">
          <div className="student-error-card">
            <span>!</span>

            <h2>
              Unable to load applications
            </h2>

            <p>{error}</p>

            <Link
              to="/scholarships"
              className="btn btn-secondary"
            >
              Browse Scholarships
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // COUNTS
  // ==========================================

  const submittedCount =
    applications.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "submitted"
    ).length;

  const reviewCount =
    applications.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "under review"
    ).length;

  const selectedCount =
    applications.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "selected"
    ).length;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="student-page">
      <div className="student-container">

        {/* HEADER */}

        <div className="student-page-header">
          <div>
            <span className="student-eyebrow">
              Application Tracking
            </span>

            <h1>
              My Applications
            </h1>

            <p>
              Track your scholarship
              applications and stay
              updated on their current
              review status.
            </p>
          </div>

          <Link
            to="/scholarships"
            className="btn btn-primary my-applications-browse-button"
          >
            Browse Scholarships
          </Link>
        </div>

        {/* ==================================
            APPLICATION STATISTICS
            ================================== */}

        {applications.length > 0 && (
          <section className="application-stat-grid">

            <div className="application-stat-card">
              <div className="application-stat-icon">
                📄
              </div>

              <div>
                <strong>
                  {applications.length}
                </strong>

                <span>
                  Total Applications
                </span>
              </div>
            </div>

            <div className="application-stat-card">
              <div className="application-stat-icon">
                ✓
              </div>

              <div>
                <strong>
                  {submittedCount}
                </strong>

                <span>
                  Submitted
                </span>
              </div>
            </div>

            <div className="application-stat-card">
              <div className="application-stat-icon">
                ◷
              </div>

              <div>
                <strong>
                  {reviewCount}
                </strong>

                <span>
                  Under Review
                </span>
              </div>
            </div>

            <div className="application-stat-card">
              <div className="application-stat-icon">
                ★
              </div>

              <div>
                <strong>
                  {selectedCount}
                </strong>

                <span>
                  Selected
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ==================================
            NO APPLICATIONS
            ================================== */}

        {applications.length === 0 ? (
          <section className="my-applications-empty">
            <div className="my-applications-empty-icon">
              🎓
            </div>

            <h2>
              No applications yet
            </h2>

            <p>
              You have not submitted any
              scholarship applications.
              Explore available
              opportunities and find one
              that matches your profile.
            </p>

            <Link
              to="/scholarships"
              className="btn btn-primary"
            >
              Browse Scholarships
            </Link>
          </section>
        ) : (
          <>
            {/* LIST HEADING */}

            <div className="application-list-heading">
              <div>
                <h2>
                  Application History
                </h2>

                <p>
                  Your submitted
                  scholarship
                  applications.
                </p>
              </div>

              <span>
                {applications.length}{" "}
                application
                {applications.length !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>

            {/* APPLICATION LIST */}

            <section className="my-application-list">
              {applications.map(
                (application) => (
                  <article
                    key={application._id}
                    className="my-application-card"
                  >
                    <div className="my-application-main">

                      <div className="my-application-icon">
                        🎓
                      </div>

                      <div className="my-application-content">
                        <div className="my-application-title-row">
                          <div>
                            <p className="my-application-provider">
                              {application
                                .scholarship
                                ?.provider ||
                                "Scholarship Provider"}
                            </p>

                            <h2>
                              {application
                                .scholarship
                                ?.title ||
                                "Scholarship"}
                            </h2>
                          </div>

                          <span
                            className={`application-status-badge ${getStatusClass(
                              application.status
                            )}`}
                          >
                            <span>
                              {getStatusIcon(
                                application.status
                              )}
                            </span>

                            {application.status}
                          </span>
                        </div>

                        <div className="my-application-meta">
                          <div>
                            <span>
                              Amount
                            </span>

                            <strong>
                              {application
                                .scholarship
                                ?.amount !==
                              undefined
                                ? `Rs. ${formatAmount(
                                    application
                                      .scholarship
                                      .amount
                                  )}`
                                : "Not available"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Applied On
                            </span>

                            <strong>
                              {new Date(
                                application.createdAt
                              ).toLocaleDateString()}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Current Status
                            </span>

                            <strong className="application-status-text">
                              {
                                application.status
                              }
                            </strong>
                          </div>
                        </div>

                        <div className="application-status-message">
                          <span>
                            {getStatusIcon(
                              application.status
                            )}
                          </span>

                          <p>
                            {getStatusDescription(
                              application.status
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="my-application-footer">
                      <span>
                        Application ID:{" "}
                        {application._id.slice(
                          -8
                        )}
                      </span>

                      {application.scholarship && (
                        <Link
                          to={`/scholarships/${application.scholarship._id}`}
                          className="btn btn-secondary my-application-view-button"
                        >
                          View Scholarship
                          <span>→</span>
                        </Link>
                      )}
                    </div>
                  </article>
                )
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default MyApplications;