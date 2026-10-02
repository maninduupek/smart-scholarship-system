import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function ApplicationForm() {
  const { id } = useParams();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    course: "",
    academicYear: "",
    statement: "",
  });

  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD SCHOLARSHIP + STUDENT PROFILE
  // ==========================================

  useEffect(() => {
    const loadApplicationData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login to apply for a scholarship."
        );
        setLoading(false);
        return;
      }

      try {
        // LOAD SCHOLARSHIP

        const scholarshipResponse = await fetch(
          `http://localhost:5000/api/scholarships/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const scholarshipData =
          await scholarshipResponse.json();

        if (!scholarshipResponse.ok) {
          setError(
            scholarshipData.message ||
              "Failed to load scholarship."
          );
          return;
        }

        setScholarship(scholarshipData.scholarship);

        // LOAD STUDENT PROFILE

        const profileResponse = await fetch(
          "http://localhost:5000/api/student/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profileData =
          await profileResponse.json();

        if (!profileResponse.ok) {
          setError(
            profileData.message ||
              "Failed to load student profile."
          );
          return;
        }

        setFormData({
          fullName:
            profileData.user?.fullName || "",
          email:
            profileData.user?.email || "",
          university:
            profileData.profile?.university || "",
          course:
            profileData.profile?.course || "",
          academicYear:
            profileData.profile?.academicYear || "",
          statement: "",
        });
      } catch (error) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplicationData();
  }, [id]);

  // ==========================================
  // TEXT INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  // ==========================================
  // DOCUMENT SELECTION
  // ==========================================

  const handleDocumentChange = (e) => {
    setError("");
    setMessage("");

    const selectedFiles =
      Array.from(e.target.files);

    // MAXIMUM 5 DOCUMENTS

    if (selectedFiles.length > 5) {
      setError(
        "You can upload a maximum of 5 documents."
      );

      e.target.value = "";
      setDocuments([]);
      return;
    }

    // ALLOWED FILE TYPES

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".doc",
      ".docx",
    ];

    for (const file of selectedFiles) {
      const fileName =
        file.name.toLowerCase();

      const hasAllowedExtension =
        allowedExtensions.some((extension) =>
          fileName.endsWith(extension)
        );

      const hasAllowedType =
        allowedTypes.includes(file.type);

      if (
        !hasAllowedType ||
        !hasAllowedExtension
      ) {
        setError(
          `${file.name} is not allowed. Only PDF, JPG, JPEG, PNG, DOC and DOCX files are allowed.`
        );

        e.target.value = "";
        setDocuments([]);
        return;
      }

      // MAXIMUM 5 MB

      if (file.size > 5 * 1024 * 1024) {
        setError(
          `${file.name} is larger than 5 MB.`
        );

        e.target.value = "";
        setDocuments([]);
        return;
      }
    }

    setDocuments(selectedFiles);
  };

  // ==========================================
  // SUBMIT APPLICATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login before submitting an application."
      );
      return;
    }

    if (!formData.statement.trim()) {
      setError(
        "Please enter your statement of purpose."
      );
      return;
    }

    setSubmitting(true);

    try {
      const applicationData =
        new FormData();

      applicationData.append(
        "scholarshipId",
        id
      );

      applicationData.append(
        "statement",
        formData.statement
      );

      documents.forEach((file) => {
        applicationData.append(
          "documents",
          file
        );
      });

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: applicationData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to submit application."
        );
        return;
      }

      setMessage(
        "Application submitted successfully!"
      );

      setFormData((previousData) => ({
        ...previousData,
        statement: "",
      }));

      setDocuments([]);

      const fileInput =
        document.getElementById(
          "applicationDocuments"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // FORMAT AMOUNT
  // ==========================================

  const formatAmount = (amount) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
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
              Preparing your application
            </h2>

            <p>
              Loading your profile and
              scholarship information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // SCHOLARSHIP NOT FOUND
  // ==========================================

  if (!scholarship) {
    return (
      <main className="student-page">
        <div className="student-container">
          <div className="student-error-card">
            <span>!</span>

            <h2>
              Scholarship Application
            </h2>

            <p>
              {error ||
                "Scholarship not found."}
            </p>

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

          <Link
            to={`/scholarships/${id}`}
          >
            Details
          </Link>

          <span>›</span>

          <span>Application</span>
        </div>

        {/* HEADER */}

        <div className="student-page-header application-page-header">
          <div>
            <span className="student-eyebrow">
              Scholarship Application
            </span>

            <h1>
              Submit Your Application
            </h1>

            <p>
              Review your academic
              information, prepare your
              documents and tell the
              provider why you are a
              strong candidate.
            </p>
          </div>

          <div className="profile-header-icon">
            📝
          </div>
        </div>

        {/* MESSAGES */}

        {message && (
          <div className="application-success-message">
            <div className="application-message-icon">
              ✓
            </div>

            <div>
              <strong>
                Application Submitted
              </strong>

              <p>{message}</p>

              <Link to="/my-applications">
                View My Applications →
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <strong>
              Unable to continue
            </strong>

            <span>{error}</span>
          </div>
        )}

        <div className="application-layout">

          {/* ==================================
              APPLICATION FORM
              ================================== */}

          <section className="application-form-card">

            <div className="application-section-heading">
              <div className="application-section-number">
                1
              </div>

              <div>
                <h2>
                  Academic Information
                </h2>

                <p>
                  Information automatically
                  loaded from your student
                  profile.
                </p>
              </div>
            </div>

            <div className="application-profile-grid">

              <div className="form-group">
                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={formData.fullName}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>
                  University
                </label>

                <input
                  type="text"
                  value={formData.university}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>
                  Degree / Course
                </label>

                <input
                  type="text"
                  value={formData.course}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>
                  Academic Year
                </label>

                <input
                  type="text"
                  value={
                    formData.academicYear
                      ? `Year ${formData.academicYear}`
                      : ""
                  }
                  disabled
                />
              </div>
            </div>

            <div className="application-profile-note">
              <span>ℹ</span>

              <p>
                Need to change this
                information?{" "}
                <Link to="/profile">
                  Update your student
                  profile
                </Link>
                .
              </p>
            </div>

            <div className="application-divider" />

            {/* STATEMENT */}

            <div className="application-section-heading">
              <div className="application-section-number">
                2
              </div>

              <div>
                <h2>
                  Statement of Purpose
                </h2>

                <p>
                  Explain why you are
                  applying for this
                  scholarship.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="statement">
                  Your Statement
                </label>

                <textarea
                  id="statement"
                  name="statement"
                  value={formData.statement}
                  onChange={handleChange}
                  rows="7"
                  required
                  placeholder="Explain your academic goals, achievements and why this scholarship would support your future..."
                />

                <div className="statement-helper">
                  <span>
                    Write a clear and
                    meaningful statement.
                  </span>

                  <span>
                    {
                      formData.statement
                        .length
                    }{" "}
                    characters
                  </span>
                </div>
              </div>

              <div className="application-divider" />

              {/* DOCUMENTS */}

              <div className="application-section-heading">
                <div className="application-section-number">
                  3
                </div>

                <div>
                  <h2>
                    Supporting Documents
                  </h2>

                  <p>
                    Upload documents that
                    support your
                    application.
                  </p>
                </div>
              </div>

              <div className="required-document-box">
                <h3>
                  Required by Provider
                </h3>

                {scholarship.requirements &&
                scholarship.requirements
                  .length > 0 ? (
                  <div className="application-requirement-list">
                    {scholarship.requirements.map(
                      (
                        requirement,
                        index
                      ) => (
                        <div
                          key={index}
                          className="application-requirement-item"
                        >
                          <span>✓</span>

                          <p>
                            {requirement}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="no-document-message">
                    No specific documents
                    have been listed by
                    the provider.
                  </p>
                )}
              </div>

              <div className="application-upload-area">
                <div className="upload-area-icon">
                  ↑
                </div>

                <h3>
                  Upload Your Documents
                </h3>

                <p>
                  Select up to 5 supporting
                  files from your device.
                </p>

                <label
                  htmlFor="applicationDocuments"
                  className="upload-select-button"
                >
                  Choose Files
                </label>

                <input
                  id="applicationDocuments"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  onChange={
                    handleDocumentChange
                  }
                  className="application-file-input"
                />

                <small>
                  PDF, JPG, JPEG, PNG, DOC
                  or DOCX • Maximum 5 MB
                  per file
                </small>
              </div>

              {/* SELECTED FILES */}

              {documents.length > 0 && (
                <div className="selected-documents-card">
                  <div className="selected-documents-heading">
                    <h3>
                      Selected Documents
                    </h3>

                    <span>
                      {documents.length}/5
                    </span>
                  </div>

                  <div className="selected-document-list">
                    {documents.map(
                      (file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="selected-document-item"
                        >
                          <div className="selected-document-icon">
                            📄
                          </div>

                          <div className="selected-document-info">
                            <strong>
                              {file.name}
                            </strong>

                            <span>
                              {(
                                file.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </span>
                          </div>

                          <span className="selected-document-ready">
                            Ready
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="application-submit-area">
                <div>
                  <strong>
                    Ready to submit?
                  </strong>

                  <p>
                    Review your information
                    before sending the
                    application.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary application-submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Application"}
                </button>
              </div>
            </form>
          </section>

          {/* ==================================
              SCHOLARSHIP SIDEBAR
              ================================== */}

          <aside className="application-sidebar">

            <section className="application-scholarship-card">
              <span className="application-sidebar-label">
                Applying For
              </span>

              <h2>
                {scholarship.title}
              </h2>

              <p className="application-provider">
                {scholarship.provider}
              </p>

              <div className="application-summary-divider" />

              <div className="application-summary-row">
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

              <div className="application-summary-row">
                <span>Deadline</span>

                <strong>
                  {new Date(
                    scholarship.deadline
                  ).toLocaleDateString()}
                </strong>
              </div>

              <div className="application-summary-row">
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
                    : "Any"}
                </strong>
              </div>

              <Link
                to={`/scholarships/${id}`}
                className="application-view-details"
              >
                View Scholarship Details
                →
              </Link>
            </section>

            <section className="application-help-card">
              <div>
                💡
              </div>

              <h3>
                Before You Submit
              </h3>

              <p>
                Make sure your statement is
                complete and all selected
                documents are correct.
                Applications cannot be
                submitted twice for the
                same scholarship.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default ApplicationForm;