import { useEffect, useState } from "react";

function ProviderApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [openingDocument, setOpeningDocument] = useState("");
  const [updatingApplication, setUpdatingApplication] = useState("");

  // ==========================================
  // GET PROVIDER APPLICATIONS
  // ==========================================

  const fetchApplications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to view applications.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/applications/provider",
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
          data.message || "Failed to load applications."
        );
        return;
      }

      setApplications(data.applications || []);

      const initialStatuses = {};

      (data.applications || []).forEach((application) => {
        initialStatuses[application._id] =
          application.status;
      });

      setSelectedStatuses(initialStatuses);
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ==========================================
  // HANDLE STATUS DROPDOWN
  // ==========================================

  const handleStatusChange = (
    applicationId,
    status
  ) => {
    setSelectedStatuses((previousStatuses) => ({
      ...previousStatuses,
      [applicationId]: status,
    }));
  };

  // ==========================================
  // UPDATE APPLICATION STATUS
  // ==========================================

  const updateStatus = async (applicationId) => {
    const token = localStorage.getItem("token");

    setMessage("");
    setError("");

    if (!token) {
      setError(
        "Please login to update application status."
      );
      return;
    }

    setUpdatingApplication(applicationId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status:
              selectedStatuses[applicationId],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update application status."
        );
        return;
      }

      setMessage(
        "Application status updated successfully!"
      );

      await fetchApplications();
    } catch (error) {
      setError(
        "Unable to connect to the server."
      );
    } finally {
      setUpdatingApplication("");
    }
  };

  // ==========================================
  // VIEW SECURE DOCUMENT
  // ==========================================

  const viewDocument = async (
    applicationId,
    documentId
  ) => {
    const token = localStorage.getItem("token");

    setError("");
    setMessage("");

    if (!token) {
      setError(
        "Please login to view documents."
      );
      return;
    }

    const documentKey =
      `${applicationId}-${documentId}`;

    setOpeningDocument(documentKey);

    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/documents/${documentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let errorMessage =
          "Failed to open the document.";

        try {
          const data = await response.json();

          if (data.message) {
            errorMessage = data.message;
          }
        } catch (error) {
          // Response was not JSON
        }

        setError(errorMessage);
        return;
      }

      const fileBlob =
        await response.blob();

      const fileURL =
        window.URL.createObjectURL(fileBlob);

      const newWindow = window.open(
        fileURL,
        "_blank",
        "noopener,noreferrer"
      );

      if (!newWindow) {
        setError(
          "The browser blocked the document window. Please allow pop-ups and try again."
        );
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(fileURL);
      }, 60000);
    } catch (error) {
      setError(
        "Unable to connect to the server while opening the document."
      );
    } finally {
      setOpeningDocument("");
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "Unknown size";
    }

    const sizeInMB =
      bytes / 1024 / 1024;

    if (sizeInMB >= 1) {
      return `${sizeInMB.toFixed(2)} MB`;
    }

    const sizeInKB = bytes / 1024;

    return `${sizeInKB.toFixed(2)} KB`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "submitted":
        return "provider-app-status-submitted";

      case "under review":
        return "provider-app-status-review";

      case "selected":
        return "provider-app-status-selected";

      case "rejected":
        return "provider-app-status-rejected";

      default:
        return "";
    }
  };

  const getStatusLabel = (status) => {
    if (status === "under review") {
      return "Under Review";
    }

    return (
      status?.charAt(0).toUpperCase() +
      status?.slice(1)
    );
  };

  const submittedCount =
    applications.filter(
      (application) =>
        application.status === "submitted"
    ).length;

  const reviewCount =
    applications.filter(
      (application) =>
        application.status === "under review"
    ).length;

  const selectedCount =
    applications.filter(
      (application) =>
        application.status === "selected"
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

            <h2>Loading applications</h2>

            <p>
              Retrieving student applications
              for your scholarships...
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

            <h1>Student Applications</h1>

            <p>
              Review students who have applied
              for your scholarships, securely
              inspect their documents and manage
              application decisions.
            </p>
          </div>
        </div>

        {/* MESSAGES */}

        {message && (
          <div className="provider-success-message">
            <div className="provider-message-icon">
              ✓
            </div>

            <div>
              <strong>
                Application Updated
              </strong>

              <p>{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <strong>
              Unable to complete request
            </strong>

            <span>{error}</span>
          </div>
        )}

        {/* STATS */}

        {applications.length > 0 && (
          <section className="provider-application-stats">

            <div className="provider-app-stat-card">
              <span>Total</span>

              <strong>
                {applications.length}
              </strong>

              <p>
                Applications received
              </p>
            </div>

            <div className="provider-app-stat-card">
              <span>New</span>

              <strong>
                {submittedCount}
              </strong>

              <p>
                Awaiting review
              </p>
            </div>

            <div className="provider-app-stat-card">
              <span>Reviewing</span>

              <strong>
                {reviewCount}
              </strong>

              <p>
                Under review
              </p>
            </div>

            <div className="provider-app-stat-card">
              <span>Selected</span>

              <strong>
                {selectedCount}
              </strong>

              <p>
                Successful applicants
              </p>
            </div>
          </section>
        )}

        {/* EMPTY */}

        {applications.length === 0 ? (
          <section className="provider-empty-state">
            <div className="provider-empty-icon">
              📄
            </div>

            <h2>
              No applications yet
            </h2>

            <p>
              No students have submitted
              applications for your
              scholarships yet. Applications
              will appear here when they are
              received.
            </p>
          </section>
        ) : (
          <>
            <div className="provider-list-heading">
              <div>
                <h2>
                  Application Review
                </h2>

                <p>
                  Review applicant details,
                  supporting documents and
                  update each application.
                </p>
              </div>

              <span>
                {applications.length}{" "}
                application
                {applications.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>

            {/* APPLICATIONS */}

            <section className="provider-applications-list">
              {applications.map(
                (application) => {
                  const currentStatus =
                    selectedStatuses[
                      application._id
                    ] ||
                    application.status;

                  const isUpdating =
                    updatingApplication ===
                    application._id;

                  const statusChanged =
                    currentStatus !==
                    application.status;

                  return (
                    <article
                      key={application._id}
                      className="provider-application-card"
                    >
                      {/* TOP */}

                      <div className="provider-application-top">
                        <div>
                          <span className="provider-application-label">
                            Scholarship
                          </span>

                          <h2>
                            {application
                              .scholarship
                              ?.title ||
                              "Scholarship"}
                          </h2>

                          <p>
                            {application
                              .scholarship
                              ?.provider ||
                              "Provider not available"}
                          </p>
                        </div>

                        <span
                          className={`provider-application-status ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {getStatusLabel(
                            application.status
                          )}
                        </span>
                      </div>

                      {/* BODY */}

                      <div className="provider-application-body">

                        {/* STUDENT */}

                        <section className="provider-applicant-section">
                          <div className="provider-app-section-title">
                            <div>
                              👤
                            </div>

                            <div>
                              <h3>
                                Student Information
                              </h3>

                              <p>
                                Applicant profile
                                at submission time
                              </p>
                            </div>
                          </div>

                          <div className="provider-applicant-grid">
                            <div>
                              <span>
                                Full Name
                              </span>

                              <strong>
                                {application.fullName}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Email Address
                              </span>

                              <strong>
                                {application.email}
                              </strong>
                            </div>

                            <div>
                              <span>
                                University
                              </span>

                              <strong>
                                {application.university}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Course
                              </span>

                              <strong>
                                {application.course}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Academic Year
                              </span>

                              <strong>
                                Year{" "}
                                {application.academicYear}
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
                          </div>
                        </section>

                        {/* STATEMENT */}

                        <section className="provider-applicant-section">
                          <div className="provider-app-section-title">
                            <div>
                              ✎
                            </div>

                            <div>
                              <h3>
                                Statement of Purpose
                              </h3>

                              <p>
                                Student's
                                application statement
                              </p>
                            </div>
                          </div>

                          <div className="provider-statement-box">
                            <p>
                              {application.statement}
                            </p>
                          </div>
                        </section>

                        {/* DOCUMENTS */}

                        <section className="provider-applicant-section">
                          <div className="provider-app-section-title">
                            <div>
                              📎
                            </div>

                            <div>
                              <h3>
                                Uploaded Documents
                              </h3>

                              <p>
                                Securely review the
                                supporting files
                              </p>
                            </div>
                          </div>

                          {application.documents &&
                          application.documents
                            .length > 0 ? (
                            <div className="provider-documents-grid">
                              {application.documents.map(
                                (
                                  document,
                                  index
                                ) => {
                                  const documentKey =
                                    `${application._id}-${
                                      document._id ||
                                      index
                                    }`;

                                  const isOpening =
                                    openingDocument ===
                                    documentKey;

                                  return (
                                    <div
                                      className="provider-document-card"
                                      key={
                                        document._id ||
                                        index
                                      }
                                    >
                                      <div className="provider-document-icon">
                                        📄
                                      </div>

                                      <div className="provider-document-info">
                                        <strong>
                                          {document.originalName}
                                        </strong>

                                        <span>
                                          {formatFileSize(
                                            document.fileSize
                                          )}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        className="provider-document-button"
                                        onClick={() =>
                                          viewDocument(
                                            application._id,
                                            document._id
                                          )
                                        }
                                        disabled={
                                          !document._id ||
                                          isOpening
                                        }
                                      >
                                        {isOpening
                                          ? "Opening..."
                                          : "View"}
                                      </button>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <div className="provider-no-documents">
                              No documents were
                              uploaded with this
                              application.
                            </div>
                          )}
                        </section>
                      </div>

                      {/* REVIEW CONTROL */}

                      <div className="provider-review-panel">
                        <div className="provider-review-info">
                          <span>
                            Application Decision
                          </span>

                          <p>
                            Change the status to
                            reflect the current
                            review decision.
                          </p>
                        </div>

                        <div className="provider-review-controls">
                          <select
                            value={
                              currentStatus
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                application._id,
                                e.target.value
                              )
                            }
                          >
                            <option value="submitted">
                              Submitted
                            </option>

                            <option value="under review">
                              Under Review
                            </option>

                            <option value="selected">
                              Selected
                            </option>

                            <option value="rejected">
                              Rejected
                            </option>
                          </select>

                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              updateStatus(
                                application._id
                              )
                            }
                            disabled={
                              isUpdating ||
                              !statusChanged
                            }
                          >
                            {isUpdating
                              ? "Updating..."
                              : statusChanged
                                ? "Update Status"
                                : "No Changes"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default ProviderApplications;