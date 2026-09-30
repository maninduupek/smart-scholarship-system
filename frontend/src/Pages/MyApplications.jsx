import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your applications.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/applications/my",
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

  if (loading) {
    return (
      <main>
        <h1>My Applications</h1>
        <p>Loading applications...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>My Applications</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>My Applications</h1>

        <p>
          View the scholarships you have applied for and
          track your application status.
        </p>

        {applications.length === 0 ? (
          <div>
            <p>You have not submitted any applications yet.</p>

            <Link to="/scholarships">
              <button>Browse Scholarships</button>
            </Link>
          </div>
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

                <p>
                  <strong>Amount:</strong> Rs.{" "}
                  {application.scholarship?.amount ||
                    "Not available"}
                </p>

                <p>
                  <strong>Application Status:</strong>{" "}
                  {application.status}
                </p>

                <p>
                  <strong>Applied On:</strong>{" "}
                  {new Date(
                    application.createdAt
                  ).toLocaleDateString()}
                </p>

                {application.scholarship && (
                  <Link
                    to={`/scholarships/${application.scholarship._id}`}
                  >
                    <button>View Scholarship</button>
                  </Link>
                )}

                <hr />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyApplications;