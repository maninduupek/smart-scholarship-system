import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function ScholarshipDetails() {
  const { id } = useParams();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScholarship = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view scholarship details.");
        setLoading(false);
        return;
      }

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
          setError(data.message || "Failed to load scholarship.");
          setLoading(false);
          return;
        }

        setScholarship(data.scholarship);
      } catch (error) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id]);

  if (loading) {
    return (
      <main>
        <h1>Scholarship Details</h1>
        <p>Loading scholarship...</p>
      </main>
    );
  }

  if (error) {
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

  return (
    <main>
      <section>
        <h1>{scholarship.title}</h1>

        <h3>{scholarship.provider}</h3>

        <p>{scholarship.description}</p>

        <h2>Scholarship Amount</h2>

        <p>
          Rs. {scholarship.amount}
        </p>

        <h2>Application Deadline</h2>

        <p>
          {new Date(
            scholarship.deadline
          ).toLocaleDateString()}
        </p>

        <h2>Eligibility</h2>

        <p>{scholarship.eligibility}</p>

        <h2>Requirements</h2>

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
          <p>No specific requirements listed.</p>
        )}

        <br />

        <Link to={`/scholarships/${scholarship._id}/apply`}>
          <button>Apply Now</button>
        </Link>

        <br />
        <br />

        <Link to="/scholarships">
          <button>Back to Scholarships</button>
        </Link>
      </section>
    </main>
  );
}

export default ScholarshipDetails;