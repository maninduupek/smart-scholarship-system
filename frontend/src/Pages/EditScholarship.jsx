import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditScholarship() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD SCHOLARSHIP
  // ==========================================

  useEffect(() => {
    const fetchScholarship = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as a provider.");
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
          setError(
            data.message || "Failed to load scholarship."
          );
          return;
        }

        const scholarship = data.scholarship;

        setFormData({
          title: scholarship.title || "",
          provider: scholarship.provider || "",
          description: scholarship.description || "",
          amount: scholarship.amount ?? "",

          deadline: scholarship.deadline
            ? scholarship.deadline.split("T")[0]
            : "",

          eligibility: scholarship.eligibility || "",

          minimumGPA:
            scholarship.minimumGPA === undefined ||
            scholarship.minimumGPA === null ||
            scholarship.minimumGPA === 0
              ? ""
              : scholarship.minimumGPA,

          requiredAcademicYear:
            scholarship.requiredAcademicYear === undefined ||
            scholarship.requiredAcademicYear === null
              ? ""
              : scholarship.requiredAcademicYear,

          requiredCourse:
            scholarship.requiredCourse || "",

          requirements:
            scholarship.requirements?.join(", ") || "",
        });
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
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // SUBMIT UPDATED SCHOLARSHIP
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login as a provider.");
      return;
    }

    // Validate GPA
    if (
      formData.minimumGPA !== "" &&
      (Number(formData.minimumGPA) < 0 ||
        Number(formData.minimumGPA) > 4)
    ) {
      setError("Minimum GPA must be between 0 and 4.");
      return;
    }

    // Convert comma-separated requirements to array
    const requirementsArray = formData.requirements
      .split(",")
      .map((requirement) => requirement.trim())
      .filter((requirement) => requirement !== "");

    setSaving(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/scholarships/${id}`,
        {
          method: "PUT",

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

            requiredCourse:
              formData.requiredCourse.trim(),

            requirements: requirementsArray,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to update scholarship."
        );
        return;
      }

      setMessage("Scholarship updated successfully!");

      setTimeout(() => {
        navigate("/my-scholarships");
      }, 1000);
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main>
        <h1>Edit Scholarship</h1>
        <p>Loading scholarship...</p>
      </main>
    );
  }

  // ==========================================
  // LOAD ERROR
  // ==========================================

  if (error && !formData.title) {
    return (
      <main>
        <h1>Edit Scholarship</h1>
        <p>{error}</p>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main>
      <section>
        <h1>Edit Scholarship</h1>

        <p>
          Update the scholarship information and
          eligibility criteria below.
        </p>

        {message && <p>{message}</p>}
        {error && <p>{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* SCHOLARSHIP TITLE */}

          <div>
            <label htmlFor="title">
              Scholarship Title
            </label>

            <br />

            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          {/* PROVIDER */}

          <div>
            <label htmlFor="provider">
              Provider / Organization Name
            </label>

            <br />

            <input
              id="provider"
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          {/* DESCRIPTION */}

          <div>
            <label htmlFor="description">
              Description
            </label>

            <br />

            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          {/* AMOUNT */}

          <div>
            <label htmlFor="amount">
              Scholarship Amount (Rs.)
            </label>

            <br />

            <input
              id="amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <br />

          {/* DEADLINE */}

          <div>
            <label htmlFor="deadline">
              Application Deadline
            </label>

            <br />

            <input
              id="deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          {/* GENERAL ELIGIBILITY DESCRIPTION */}

          <div>
            <label htmlFor="eligibility">
              Eligibility Description
            </label>

            <br />

            <textarea
              id="eligibility"
              name="eligibility"
              rows="4"
              value={formData.eligibility}
              onChange={handleChange}
              required
            />

            <p>
              Example: Second-year Computer Engineering
              students with a GPA of at least 3.00.
            </p>
          </div>

          <br />

          <h2>Structured Eligibility Criteria</h2>

          <p>
            These values are used by the system to
            automatically check student eligibility.
          </p>

          {/* MINIMUM GPA */}

          <div>
            <label htmlFor="minimumGPA">
              Minimum GPA
            </label>

            <br />

            <input
              id="minimumGPA"
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
              Leave empty if there is no minimum GPA
              requirement.
            </p>
          </div>

          <br />

          {/* REQUIRED ACADEMIC YEAR */}

          <div>
            <label htmlFor="requiredAcademicYear">
              Required Academic Year
            </label>

            <br />

            <select
              id="requiredAcademicYear"
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
            <label htmlFor="requiredCourse">
              Required Course
            </label>

            <br />

            <input
              id="requiredCourse"
              type="text"
              name="requiredCourse"
              value={formData.requiredCourse}
              onChange={handleChange}
              placeholder="Example: Computer Engineering"
            />

            <p>
              Leave empty if students from any course
              can apply.
            </p>
          </div>

          <br />

          {/* REQUIREMENTS */}

          <div>
            <label htmlFor="requirements">
              Required Documents / Requirements
            </label>

            <p>
              Enter requirements separated by commas.
            </p>

            <textarea
              id="requirements"
              name="requirements"
              rows="4"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Academic Transcript, Student ID, Recommendation Letter"
            />
          </div>

          <br />

          {/* BUTTONS */}

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

          {" "}

          <button
            type="button"
            onClick={() =>
              navigate("/my-scholarships")
            }
            disabled={saving}
          >
            Cancel
          </button>
        </form>
      </section>
    </main>
  );
}

export default EditScholarship;