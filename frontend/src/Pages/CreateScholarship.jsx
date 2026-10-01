import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateScholarship() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    provider: "",
    description: "",
    amount: "",
    deadline: "",
    eligibility: "",

    // Structured eligibility
    minimumGPA: "",
    requiredAcademicYear: "",
    requiredCourse: "",

    requirements: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
  // CREATE SCHOLARSHIP
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to create a scholarship.");
      return;
    }

    // Convert comma-separated requirements into an array
    const requirementsArray = formData.requirements
      .split(",")
      .map((requirement) => requirement.trim())
      .filter((requirement) => requirement !== "");

    try {
      const response = await fetch(
        "http://localhost:5000/api/scholarships",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: formData.title,
            provider: formData.provider,
            description: formData.description,
            amount: Number(formData.amount),
            deadline: formData.deadline,
            eligibility: formData.eligibility,

            minimumGPA:
              formData.minimumGPA === ""
                ? 0
                : Number(formData.minimumGPA),

            requiredAcademicYear:
              formData.requiredAcademicYear === ""
                ? null
                : Number(formData.requiredAcademicYear),

            requiredCourse: formData.requiredCourse,

            requirements: requirementsArray,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to create scholarship."
        );
        return;
      }

      setMessage("Scholarship created successfully!");

      // Clear form after successful creation
      setFormData({
        title: "",
        provider: "",
        description: "",
        amount: "",
        deadline: "",
        eligibility: "",
        minimumGPA: "",
        requiredAcademicYear: "",
        requiredCourse: "",
        requirements: "",
      });

      // Go to provider scholarship list after a short delay
      setTimeout(() => {
        navigate("/my-scholarships");
      }, 1000);
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main>
      <section>
        <h1>Create Scholarship</h1>

        <p>
          Enter the scholarship information and eligibility
          requirements below.
        </p>

        {message && <p>{message}</p>}

        {error && <p>{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* SCHOLARSHIP TITLE */}

          <div>
            <label>Scholarship Title</label>
            <br />

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Engineering Excellence Scholarship"
              required
            />
          </div>

          <br />

          {/* PROVIDER */}

          <div>
            <label>Scholarship Provider</label>
            <br />

            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              placeholder="Example Foundation"
              required
            />
          </div>

          <br />

          {/* DESCRIPTION */}

          <div>
            <label>Description</label>
            <br />

            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the scholarship..."
              required
            ></textarea>
          </div>

          <br />

          {/* AMOUNT */}

          <div>
            <label>Scholarship Amount (Rs.)</label>
            <br />

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              placeholder="150000"
              required
            />
          </div>

          <br />

          {/* DEADLINE */}

          <div>
            <label>Application Deadline</label>
            <br />

            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          {/* GENERAL ELIGIBILITY */}

          <div>
            <label>Eligibility Description</label>
            <br />

            <textarea
              name="eligibility"
              rows="4"
              value={formData.eligibility}
              onChange={handleChange}
              placeholder="Example: Undergraduate engineering students with good academic performance."
              required
            ></textarea>
          </div>

          <br />

          <hr />

          <h2>Eligibility Criteria</h2>

          <p>
            These values will be used to automatically check
            whether a student is eligible.
          </p>

          {/* MINIMUM GPA */}

          <div>
            <label>Minimum GPA</label>
            <br />

            <input
              type="number"
              name="minimumGPA"
              value={formData.minimumGPA}
              onChange={handleChange}
              min="0"
              max="4"
              step="0.01"
              placeholder="Example: 3.00"
            />

            <p>
              Leave empty if there is no minimum GPA requirement.
            </p>
          </div>

          <br />

          {/* REQUIRED ACADEMIC YEAR */}

          <div>
            <label>Required Academic Year</label>
            <br />

            <select
              name="requiredAcademicYear"
              value={formData.requiredAcademicYear}
              onChange={handleChange}
            >
              <option value="">
                Any Academic Year
              </option>

              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
              <option value="5">Year 5</option>
              <option value="6">Year 6</option>
            </select>
          </div>

          <br />

          {/* REQUIRED COURSE */}

          <div>
            <label>Required Course / Degree</label>
            <br />

            <input
              type="text"
              name="requiredCourse"
              value={formData.requiredCourse}
              onChange={handleChange}
              placeholder="Example: Computer Engineering"
            />

            <p>
              Leave empty if students from any course can apply.
            </p>
          </div>

          <br />

          <hr />

          {/* REQUIRED DOCUMENTS */}

          <div>
            <label>Required Documents</label>
            <br />

            <textarea
              name="requirements"
              rows="4"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Academic Transcript, Student ID, Recommendation Letter"
            ></textarea>

            <p>
              Separate each requirement using a comma.
            </p>
          </div>

          <br />

          <button type="submit">
            Create Scholarship
          </button>
        </form>
      </section>
    </main>
  );
}

export default CreateScholarship;