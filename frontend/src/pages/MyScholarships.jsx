import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================
  // LOAD PROVIDER SCHOLARSHIPS
  // ==========================================

  const fetchMyScholarships = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login as a provider.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/scholarships/provider/my",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to load scholarships."
        );
        return;
      }

      setScholarships(data.scholarships || []);
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyScholarships();
  }, []);

  // ==========================================
  // CHANGE SCHOLARSHIP STATUS
  // ==========================================

  const changeScholarshipStatus = async (
    scholarshipId,
    newStatus
  ) => {
    const token = localStorage.getItem("token");

    setMessage("");
    setError("");
    setUpdatingId(scholarshipId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/scholarships/${scholarshipId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to change scholarship status."
        );
        return;
      }

      setMessage(data.message);

      await fetchMyScholarships();
    } catch (error) {
      setError(
        "Unable to connect to the server."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const formatAmount = (amount) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return amount;
    }

    return numericAmount.toLocaleString("en-LK");
  };

  const activeCount = scholarships.filter(
    (scholarship) =>
      scholarship.status === "active"
  ).length;

  const closedCount = scholarships.filter(
    (scholarship) =>
      scholarship.status === "closed"
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="provider-page">
        <div className="provider-container">
          <div className="student-loading-card">
            <div className="student-spinner" />

            <h2>Loading your scholarships</h2>

            <p>
              Retrieving the scholarship opportunities
              you have created...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="provider-page">
      <div className="provider-container">

        {/* HEADER */}

        <div className="provider-page-header">
          <div>
            <span className="provider-eyebrow">
              Provider Workspace
            </span>

            <h1>My Scholarships</h1>

            <p>
              View, edit and manage the scholarship
              opportunities you have created.
            </p>
          </div>

          <Link
            to="/create-scholarship"
            className="btn btn-primary"
          >
            + Create Scholarship
          </Link>
        </div>

        {/* MESSAGES */}

        {message && (
          <div className="provider-success-message">
            <div className="provider-message-icon">
              ✓
            </div>

            <div>
              <strong>Scholarship Updated</strong>
              <p>{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <strong>Unable to complete request</strong>
            <span>{error}</span>
          </div>
        )}

        {/* STATISTICS */}

        {scholarships.length > 0 && (
          <section className="provider-scholarship-stats">
            <div className="provider-stat-card">
              <div className="provider-stat-icon">
                🎓
              </div>

              <div>
                <strong>
                  {scholarships.length}
                </strong>

                <span>
                  Total Scholarships
                </span>
              </div>
            </div>

            <div className="provider-stat-card">
              <div className="provider-stat-icon provider-stat-active">
                ✓
              </div>

              <div>
                <strong>{activeCount}</strong>
                <span>Active</span>
              </div>
            </div>

            <div className="provider-stat-card">
              <div className="provider-stat-icon provider-stat-closed">
                ×
              </div>

              <div>
                <strong>{closedCount}</strong>
                <span>Closed</span>
              </div>
            </div>
          </section>
        )}

        {/* EMPTY STATE */}

        {scholarships.length === 0 ? (
          <section className="provider-empty-state">
            <div className="provider-empty-icon">
              🎓
            </div>

            <h2>
              Create your first scholarship
            </h2>

            <p>
              You have not created any scholarships yet.
              Create an opportunity and start receiving
              applications from eligible students.
            </p>

            <Link
              to="/create-scholarship"
              className="btn btn-primary"
            >
              Create Scholarship
            </Link>
          </section>
        ) : (
          <>
            {/* LIST HEADER */}

            <div className="provider-list-heading">
              <div>
                <h2>
                  Scholarship Portfolio
                </h2>

                <p>
                  Manage your published scholarship
                  opportunities.
                </p>
              </div>

              <span>
                {scholarships.length} scholarship
                {scholarships.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* SCHOLARSHIP CARDS */}

            <section className="provider-scholarship-grid">
              {scholarships.map((scholarship) => {
                const isActive =
                  scholarship.status === "active";

                const isUpdating =
                  updatingId === scholarship._id;

                return (
                  <article
                    key={scholarship._id}
                    className="provider-scholarship-card"
                  >
                    {/* CARD TOP */}

                    <div className="provider-scholarship-card-top">
                      <div className="provider-scholarship-logo">
                        🎓
                      </div>

                      <span
                        className={
                          isActive
                            ? "provider-status-badge provider-status-active"
                            : "provider-status-badge provider-status-closed"
                        }
                      >
                        <span>
                          {isActive ? "●" : "●"}
                        </span>

                        {scholarship.status}
                      </span>
                    </div>

                    {/* CONTENT */}

                    <div className="provider-scholarship-content">
                      <p className="provider-scholarship-provider">
                        {scholarship.provider}
                      </p>

                      <h2>
                        {scholarship.title}
                      </h2>

                      <p className="provider-scholarship-description">
                        {scholarship.description}
                      </p>

                      <div className="provider-scholarship-details">
                        <div>
                          <span>Amount</span>

                          <strong>
                            Rs.{" "}
                            {formatAmount(
                              scholarship.amount
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Deadline</span>

                          <strong>
                            {new Date(
                              scholarship.deadline
                            ).toLocaleDateString()}
                          </strong>
                        </div>
                      </div>

                      {/* ELIGIBILITY */}

                      <div className="provider-card-eligibility">
                        <span>
                          Eligibility
                        </span>

                        <div>
                          <span>
                            GPA{" "}
                            {Number(
                              scholarship.minimumGPA
                            ) > 0
                              ? Number(
                                  scholarship.minimumGPA
                                ).toFixed(2)
                              : "Any"}
                          </span>

                          <span>
                            {scholarship.requiredAcademicYear
                              ? `Year ${scholarship.requiredAcademicYear}`
                              : "Any Year"}
                          </span>

                          <span>
                            {scholarship.requiredCourse ||
                              "Any Course"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="provider-scholarship-actions">
                      <Link
                        to={`/scholarships/${scholarship._id}`}
                        className="provider-card-action"
                      >
                        <span>👁</span>
                        View
                      </Link>

                      <Link
                        to={`/edit-scholarship/${scholarship._id}`}
                        className="provider-card-action"
                      >
                        <span>✎</span>
                        Edit
                      </Link>

                      {isActive ? (
                        <button
                          type="button"
                          className="provider-card-action provider-close-action"
                          disabled={isUpdating}
                          onClick={() =>
                            changeScholarshipStatus(
                              scholarship._id,
                              "closed"
                            )
                          }
                        >
                          <span>×</span>

                          {isUpdating
                            ? "Updating..."
                            : "Close"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="provider-card-action provider-reopen-action"
                          disabled={isUpdating}
                          onClick={() =>
                            changeScholarshipStatus(
                              scholarship._id,
                              "active"
                            )
                          }
                        >
                          <span>↻</span>

                          {isUpdating
                            ? "Updating..."
                            : "Reopen"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default MyScholarships;