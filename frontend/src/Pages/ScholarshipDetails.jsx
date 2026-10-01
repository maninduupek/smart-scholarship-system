import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function ScholarshipDetails() {
  const { id } = useParams();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [eligibilityResult, setEligibilityResult] =
    useState(null);

  const [checkingEligibility, setCheckingEligibility] =
    useState(false);

  const token = localStorage.getItem("token");

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Failed to read user information.");
  }

  // ==========================================
  // LOAD SCHOLARSHIP
  // ==========================================

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/scholarships/${id}`,
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
            data.message ||
              "Failed to load scholarship."
          );
          return;
        }

        setScholarship(data.scholarship);
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

  const handleCheckEligibility = async () => {
    setCheckingEligibility(true);
    setEligibilityResult(null);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/scholarships/${id}/eligibility`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

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
      setCheckingEligibility(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main>
        <h1>Scholarship Details</h1>
        <p>Loading scholarship...</p>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !scholarship) {
    return (
      <main>
        <h1>Scholarship Details</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!scholarship) {
    return (
      <main>
        <h1>Scholarship Not Found</h1>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main>
      <section>
        <h1>{scholarship.title}</h1>

        <p>
          <strong>Provider:</strong>{" "}
          {scholarship.provider}
        </p>

        <p>
          <strong>Description:</strong>{" "}
          {scholarship.description}
        </p>

        <p>
          <strong>Amount:</strong> Rs.{" "}
          {scholarship.amount}
        </p>

        <p>
          <strong>Deadline:</strong>{" "}
          {new Date(
            scholarship.deadline
          ).toLocaleDateString()}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {scholarship.status}
        </p>

        <hr />

        <h2>Eligibility</h2>

        <p>{scholarship.eligibility}</p>

        <h3>Eligibility Criteria</h3>

        <p>
          <strong>Minimum GPA:</strong>{" "}
          {scholarship.minimumGPA > 0
            ? scholarship.minimumGPA
            : "No minimum GPA"}
        </p>

        <p>
          <strong>Required Academic Year:</strong>{" "}
          {scholarship.requiredAcademicYear
            ? `Year ${scholarship.requiredAcademicYear}`
            : "Any academic year"}
        </p>

        <p>
          <strong>Required Course:</strong>{" "}
          {scholarship.requiredCourse
            ? scholarship.requiredCourse
            : "Any course"}
        </p>

        <hr />

        <h2>Required Documents</h2>

        {scholarship.requirements &&
        scholarship.requirements.length > 0 ? (
          <ul>
            {scholarship.requirements.map(
              (requirement, index) => (
                <li key={index}>
                  {requirement}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>No specific documents listed.</p>
        )}

        {/* =====================================
            STUDENT ELIGIBILITY CHECK
        ====================================== */}

        {user?.role === "student" && (
          <>
            <hr />

            <h2>Check Your Eligibility</h2>

            <p>
              Check your saved student profile
              against this scholarship's
              requirements.
            </p>

            <button
              type="button"
              onClick={handleCheckEligibility}
              disabled={checkingEligibility}
            >
              {checkingEligibility
                ? "Checking..."
                : "Check Eligibility"}
            </button>

            {/* ELIGIBILITY RESULT */}

            {eligibilityResult && (
              <div>
                <br />

                {eligibilityResult.eligible ? (
                  <>
                    <h3>
                      ✅ You Are Eligible
                    </h3>

                    <p>
                      {
                        eligibilityResult.message
                      }
                    </p>

                    <Link
                      to={`/scholarships/${id}/apply`}
                    >
                      <button type="button">
                        Apply Now
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h3>
                      ❌ Not Eligible
                    </h3>

                    <p>
                      {
                        eligibilityResult.message
                      }
                    </p>

                    {eligibilityResult.reasons &&
                      eligibilityResult.reasons
                        .length > 0 && (
                        <>
                          <h4>Reasons:</h4>

                          <ul>
                            {eligibilityResult.reasons.map(
                              (
                                reason,
                                index
                              ) => (
                                <li key={index}>
                                  {reason}
                                </li>
                              )
                            )}
                          </ul>
                        </>
                      )}

                    <p>
                      You can update your student
                      profile if your information
                      has changed.
                    </p>

                    <Link to="/profile">
                      <button type="button">
                        Update My Profile
                      </button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* =====================================
            PROVIDER / ADMIN
        ====================================== */}

        {user?.role !== "student" && (
          <>
            <br />

            <Link to="/scholarships">
              Back to Scholarships
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

export default ScholarshipDetails;