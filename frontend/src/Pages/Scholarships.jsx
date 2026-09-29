import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScholarships = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view scholarships.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/scholarships",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load scholarships.");
          setLoading(false);
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

    fetchScholarships();
  }, []);

  if (loading) {
    return (
      <main>
        <h1>Available Scholarships</h1>
        <p>Loading scholarships...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Available Scholarships</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Available Scholarships</h1>

        <p>
          Explore scholarships and find opportunities that match your goals.
        </p>

        {scholarships.length === 0 ? (
          <p>No scholarships are currently available.</p>
        ) : (
          <div>
            {scholarships.map((scholarship) => (
              <div key={scholarship._id}>
                <h2>{scholarship.title}</h2>

                <h3>{scholarship.provider}</h3>

                <p>{scholarship.description}</p>

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

                <Link
                  to={`/scholarships/${scholarship._id}`}
                >
                  <button>View Details</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Scholarships;