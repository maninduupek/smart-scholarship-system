import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

function ScholarshipDetails() {
  const { id } = useParams();

  const [
    scholarship,
    setScholarship,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    eligibilityResult,
    setEligibilityResult,
  ] = useState(null);

  const [
    checkingEligibility,
    setCheckingEligibility,
  ] = useState(false);

  const token =
    localStorage.getItem("token");

  let user = null;

  try {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      user =
        JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Failed to read user information."
    );
  }

  // ==========================================
  // LOAD SCHOLARSHIP
  // ==========================================

  useEffect(() => {
    const fetchScholarship =
      async () => {
        try {
          const response =
            await fetch(
              `http://localhost:5000/api/scholarships/${id}`,
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
                "Failed to load scholarship."
            );

            return;
          }

          setScholarship(
            data.scholarship
          );
        } catch (error) {
          setError(
            "Unable to connect to the server."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchScholarship();
  }, [id, token]);

  // ==========================================
  // CHECK ELIGIBILITY
  // ==========================================

  const handleCheckEligibility =
    async () => {
      setCheckingEligibility(true);

      setEligibilityResult(null);
      setError("");

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/scholarships/${id}/eligibility`,
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
          setEligibilityResult({
            eligible: false,

            message:
              data.message ||
              "Unable to check eligibility.",

            reasons: [],
          });

          return;
        }

        setEligibilityResult(data);
      } catch (error) {
        setEligibilityResult({
          eligible: false,

          message:
            "Unable to connect to the server.",

          reasons: [],
        });
      } finally {
        setCheckingEligibility(
          false
        );
      }
    };

  // ==========================================
  // HELPERS
  // ==========================================

  const formatAmount = (amount) => {
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
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="student-page">
        <div className="student-container">
          <div className="student-loading-card">
            <div className="student-spinner" />

            <h2>
              Loading scholarship
            </h2>

            <p>
              Retrieving scholarship
              information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !scholarship) {
    return (
      <main className="student-page">
        <div className="student-container">
          <div className="student-error-card">
            <span>!</span>

            <h2>
              Scholarship unavailable
            </h2>

            <p>{error}</p>

            <Link
              to="/scholarships"
              className="btn btn-secondary"
            >
              Back to Scholarships
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!scholarship) {
    return (
      <main className="student-page">
        <div className="student-container">
          <div className="student-error-card">
            <span>?</span>

            <h2>
              Scholarship Not Found
            </h2>

            <Link
              to="/scholarships"
              className="btn btn-secondary"
            >
              Back to Scholarships
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="student-page">
      <div className="student-container">

        {/* BREADCRUMB */}

        <div className="scholarship-breadcrumb">
          <Link to="/scholarships">
            Scholarships
          </Link>

          <span>›</span>

          <span>Details</span>
        </div>

        {/* HERO */}

        <section className="details-hero">
          <div className="details-hero-main">
            <div className="details-icon">
              🎓
            </div>

            <div>
              <div className="details-badges">
                <span
                  className={
                    scholarship.status ===
                    "active"
                      ? "badge badge-success"
                      : "badge badge-warning"
                  }
                >
                  {scholarship.status}
                </span>

                {scholarship.requiredAcademicYear && (
                  <span className="badge badge-info">
                    Year{" "}
                    {
                      scholarship.requiredAcademicYear
                    }
                  </span>
                )}
              </div>

              <h1>
                {scholarship.title}
              </h1>

              <p className="details-provider">
                Offered by{" "}
                <strong>
                  {
                    scholarship.provider
                  }
                </strong>
              </p>
            </div>
          </div>

          <div className="details-amount">
            <span>
              Scholarship Amount
            </span>

            <strong>
              Rs.{" "}
              {formatAmount(
                scholarship.amount
              )}
            </strong>
          </div>
        </section>

        <div className="details-layout">

          {/* ==================================
              MAIN CONTENT
              ================================== */}

          <div className="details-main">

            {/* DESCRIPTION */}

            <section className="details-card">
              <div className="details-card-heading">
                <div className="details-heading-icon">
                  📄
                </div>

                <div>
                  <h2>
                    About This Scholarship
                  </h2>

                  <p>
                    Scholarship overview
                    and information
                  </p>
                </div>
              </div>

              <p className="details-description">
                {
                  scholarship.description
                }
              </p>
            </section>

            {/* ELIGIBILITY */}

            <section className="details-card">
              <div className="details-card-heading">
                <div className="details-heading-icon">
                  ✓
                </div>

                <div>
                  <h2>
                    Eligibility Criteria
                  </h2>

                  <p>
                    Requirements you need
                    to meet
                  </p>
                </div>
              </div>

              {scholarship.eligibility && (
                <div className="eligibility-description">
                  {
                    scholarship.eligibility
                  }
                </div>
              )}

              <div className="criteria-grid">

                <div className="criteria-item">
                  <span>
                    Minimum GPA
                  </span>

                  <strong>
                    {Number(
                      scholarship.minimumGPA
                    ) > 0
                      ? Number(
                          scholarship.minimumGPA
                        ).toFixed(2)
                      : "Any GPA"}
                  </strong>
                </div>

                <div className="criteria-item">
                  <span>
                    Academic Year
                  </span>

                  <strong>
                    {scholarship.requiredAcademicYear
                      ? `Year ${scholarship.requiredAcademicYear}`
                      : "Any Year"}
                  </strong>
                </div>

                <div className="criteria-item">
                  <span>
                    Required Course
                  </span>

                  <strong>
                    {scholarship.requiredCourse ||
                      "Any Course"}
                  </strong>
                </div>
              </div>
            </section>

            {/* DOCUMENTS */}

            <section className="details-card">
              <div className="details-card-heading">
                <div className="details-heading-icon">
                  📁
                </div>

                <div>
                  <h2>
                    Required Documents
                  </h2>

                  <p>
                    Prepare these before
                    applying
                  </p>
                </div>
              </div>

              {scholarship.requirements &&
              scholarship.requirements
                .length > 0 ? (
                <div className="requirements-list">
                  {scholarship.requirements.map(
                    (
                      requirement,
                      index
                    ) => (
                      <div
                        className="requirement-item"
                        key={index}
                      >
                        <span>
                          ✓
                        </span>

                        <p>
                          {requirement}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="no-requirements">
                  <span>✓</span>

                  <p>
                    No specific documents
                    have been listed for
                    this scholarship.
                  </p>
                </div>
              )}
            </section>

            {/* ==================================
                ELIGIBILITY RESULT
                ================================== */}

            {user?.role ===
              "student" &&
              eligibilityResult && (
                <section
                  className={`eligibility-result-card ${
                    eligibilityResult.eligible
                      ? "eligibility-success"
                      : "eligibility-failed"
                  }`}
                >
                  <div className="eligibility-result-icon">
                    {eligibilityResult.eligible
                      ? "✓"
                      : "!"}
                  </div>

                  <div className="eligibility-result-content">
                    <h2>
                      {eligibilityResult.eligible
                        ? "You Are Eligible"
                        : "Eligibility Requirements Not Met"}
                    </h2>

                    <p>
                      {
                        eligibilityResult.message
                      }
                    </p>

                    {!eligibilityResult.eligible &&
                      eligibilityResult.reasons &&
                      eligibilityResult.reasons
                        .length > 0 && (
                        <div className="eligibility-reasons">
                          <strong>
                            Reasons
                          </strong>

                          <ul>
                            {eligibilityResult.reasons.map(
                              (
                                reason,
                                index
                              ) => (
                                <li
                                  key={
                                    index
                                  }
                                >
                                  {
                                    reason
                                  }
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    <div className="eligibility-result-actions">
                      {eligibilityResult.eligible ? (
                        <Link
                          to={`/scholarships/${id}/apply`}
                          className="btn btn-success"
                        >
                          Apply Now
                          <span>→</span>
                        </Link>
                      ) : (
                        <Link
                          to="/profile"
                          className="btn btn-primary"
                        >
                          Update My Profile
                        </Link>
                      )}
                    </div>
                  </div>
                </section>
              )}
          </div>

          {/* ==================================
              SIDEBAR
              ================================== */}

          <aside className="details-sidebar">

            <section className="details-summary-card">
              <h3>
                Scholarship Summary
              </h3>

              <div className="summary-row">
                <span>Status</span>

                <strong>
                  {scholarship.status}
                </strong>
              </div>

              <div className="summary-row">
                <span>Deadline</span>

                <strong>
                  {new Date(
                    scholarship.deadline
                  ).toLocaleDateString()}
                </strong>
              </div>

              <div className="summary-row">
                <span>Provider</span>

                <strong>
                  {
                    scholarship.provider
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>Amount</span>

                <strong>
                  Rs.{" "}
                  {formatAmount(
                    scholarship.amount
                  )}
                </strong>
              </div>
            </section>

            {/* STUDENT ACTION */}

            {user?.role ===
              "student" && (
              <section className="eligibility-check-card">
                <div className="eligibility-check-icon">
                  ✓
                </div>

                <h3>
                  Are you eligible?
                </h3>

                <p>
                  Compare your saved
                  academic profile with
                  this scholarship's
                  requirements.
                </p>

                <button
                  type="button"
                  className="btn btn-primary eligibility-check-button"
                  onClick={
                    handleCheckEligibility
                  }
                  disabled={
                    checkingEligibility
                  }
                >
                  {checkingEligibility
                    ? "Checking..."
                    : "Check Eligibility"}
                </button>

                <Link
                  to="/profile"
                  className="eligibility-profile-link"
                >
                  View my academic profile
                </Link>
              </section>
            )}

            {/* PROVIDER / ADMIN */}

            {user?.role !==
              "student" && (
              <Link
                to="/scholarships"
                className="btn btn-secondary details-back-button"
              >
                ← Back to Scholarships
              </Link>
            )}

          </aside>
        </div>
      </div>
    </main>
  );
}

export default ScholarshipDetails;