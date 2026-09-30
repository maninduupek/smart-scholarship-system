import { useEffect, useState } from "react";

function ProviderApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState({});

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
        setLoading(false);
        return;
      }

      setApplications(data.applications);

      const initialStatuses = {};

      data.applications.forEach((application) => {
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

  const handleStatusChange = (applicationId, status) => {
    setSelectedStatuses({
      ...selectedStatuses,
      [applicationId]: status,
    });
  };

  // ==========================================
  // UPDATE APPLICATION STATUS
  // ==========================================

  const updateStatus = async (applicationId) => {
    const token = localStorage.getItem("token");

    setMessage("");
    setError("");

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
            status: selectedStatuses[applicationId],
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

      // Reload applications to show latest status
      await fetchApplications();
    } catch (error) {
      setError(
        "Unable to connect to the server."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main>
        <h1>Student Applications</h1>
        <p>Loading applications...</p>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main>
      <section>
        <h1>Student Applications</h1>

        <p>
          View and manage students who have applied for
          scholarships.
        </p>

        {message && <p>{message}</p>}

        {error && <p>{error}</p>}

        {applications.length === 0 ? (
          <p>No applications have been submitted yet.</p>
        ) : (
          <div>
            {applications.map((application) => (
              <div key={application._id}>
                <h2>
                  {application.scholarship?.title ||
                    "Scholarship"}
                </h2>

                <p>
                  <strong>Provider:</strong>{" "}
                  {application.scholarship?.provider ||
                    "Not available"}
                </p>

                <h3>Student Information</h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {application.fullName}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {application.email}
                </p>

                <p>
                  <strong>University:</strong>{" "}
                  {application.university}
                </p>

                <p>
                  <strong>Course:</strong>{" "}
                  {application.course}
                </p>

                <p>
                  <strong>Academic Year:</strong>{" "}
                  {application.academicYear}
                </p>

                <h3>Application Information</h3>

                <p>
                  <strong>Statement of Purpose:</strong>{" "}
                  {application.statement}
                </p>

                <p>
                  <strong>Current Status:</strong>{" "}
                  {application.status}
                </p>

                <p>
                  <strong>Applied On:</strong>{" "}
                  {new Date(
                    application.createdAt
                  ).toLocaleDateString()}
                </p>

                <h3>Update Status</h3>

                <select
                  value={
                    selectedStatuses[application._id] ||
                    application.status
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
                  onClick={() =>
                    updateStatus(application._id)
                  }
                >
                  Update Status
                </button>

                <hr />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ProviderApplications;