import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ApplicationForm() {
  const { id } = useParams();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    course: "",
    academicYear: "",
    statement: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // GET SCHOLARSHIP DETAILS
  // ==========================================

  useEffect(() => {
    const fetchScholarship = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to apply for a scholarship.");
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

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // SUBMIT APPLICATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before submitting an application.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scholarshipId: id,
            fullName: formData.fullName,
            email: formData.email,
            university: formData.university,
            course: formData.course,
            academicYear: Number(formData.academicYear),
            statement: formData.statement,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit application.");
        return;
      }

      setMessage("Application submitted successfully!");

      setFormData({
        fullName: "",
        email: "",
        university: "",
        course: "",
        academicYear: "",
        statement: "",
      });
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main>
        <h1>Apply for Scholarship</h1>
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
        <h1>Apply for Scholarship</h1>
        <p>{error}</p>
      </main>
    );
  }

  // ==========================================
  // SCHOLARSHIP NOT FOUND
  // ==========================================

  if (!scholarship) {
    return (
      <main>
        <h1>Scholarship Not Found</h1>
      </main>
    );
  }

  // ==========================================
  // APPLICATION FORM
  // ==========================================

  return (
    <main>
      <section>
        <h1>Apply for Scholarship</h1>

        <h2>{scholarship.title}</h2>

        <p>
          Provided by: {scholarship.provider}
        </p>

        {message && (
          <p>{message}</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Full Name</label>

            <br />

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label>Email</label>

            <br />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label>University</label>

            <br />

            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label>Course</label>

            <br />

            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label>Academic Year</label>

            <br />

            <input
              type="number"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              min="1"
              max="6"
              required
            />
          </div>

          <br />

          <div>
            <label>Statement of Purpose</label>

            <br />

            <textarea
              name="statement"
              rows="6"
              value={formData.statement}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <br />

          <button type="submit">
            Submit Application
          </button>
        </form>
      </section>
    </main>
  );
}

export default ApplicationForm;