import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

      setScholarships(data.scholarships);
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

  const changeScholarshipStatus = async (
    scholarshipId,
    newStatus
  ) => {
    const token = localStorage.getItem("token");

    setMessage("");
    setError("");

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
    }
  };

  if (loading) {
    return (
      <main>
        <h1>My Scholarships</h1>
        <p>Loading scholarships...</p>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>My Scholarships</h1>

        <p>
          View and manage the scholarships you have created.
        </p>

        {message && <p>{message}</p>}
        {error && <p>{error}</p>}

        <Link to="/create-scholarship">
          <button>Create New Scholarship</button>
        </Link>

        <br />
        <br />

        {scholarships.length === 0 ? (
          <p>You have not created any scholarships yet.</p>
        ) : (
          <div>
            {scholarships.map((scholarship) => (
              <div key={scholarship._id}>
                <h2>{scholarship.title}</h2>

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

                <Link
                  to={`/scholarships/${scholarship._id}`}
                >
                  <button>
                    View Scholarship
                  </button>
                </Link>

                {" "}

                <Link
                  to={`/edit-scholarship/${scholarship._id}`}
                >
                  <button>
                    Edit Scholarship
                  </button>
                </Link>

                {" "}

                {scholarship.status === "active" ? (
                  <button
                    type="button"
                    onClick={() =>
                      changeScholarshipStatus(
                        scholarship._id,
                        "closed"
                      )
                    }
                  >
                    Close Scholarship
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      changeScholarshipStatus(
                        scholarship._id,
                        "active"
                      )
                    }
                  >
                    Reopen Scholarship
                  </button>
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

export default MyScholarships;