import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CreateScholarship() {
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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // HANDLE INPUT CHANGES
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

    const requirementsArray = formData.requirements
      .split(",")
      .map((requirement) => requirement.trim())
      .filter((requirement) => requirement !== "");

    setSubmitting(true);

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

      setTimeout(() => {
        navigate("/my-scholarships");
      }, 1000);
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="provider-page">
      <div className="provider-container">

        {/* BREADCRUMB */}

        <div className="provider-breadcrumb">
          <Link to="/my-scholarships">
            My Scholarships
          </Link>

          <span>›</span>

          <span>Create Scholarship</span>
        </div>

        {/* PAGE HEADER */}

        <div className="provider-page-header">
          <div>
            <span className="provider-eyebrow">
              Scholarship Management
            </span>

            <h1>Create Scholarship</h1>

            <p>
              Create a new scholarship opportunity and define
              the eligibility criteria for student applications.
            </p>
          </div>

          <Link
            to="/my-scholarships"
            className="btn btn-secondary"
          >
            ← My Scholarships
          </Link>
        </div>

        {/* SUCCESS */}

        {message && (
          <div className="provider-success-message">
            <div className="provider-message-icon">
              ✓
            </div>

            <div>
              <strong>Scholarship Created</strong>
              <p>{message}</p>
              <span>
                Redirecting to your scholarships...
              </span>
            </div>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="alert alert-error">
            <strong>Unable to create scholarship</strong>
            <span>{error}</span>
          </div>
        )}

        <div className="provider-form-layout">

          {/* ==================================
              MAIN FORM
              ================================== */}

          <form
            className="provider-form-card"
            onSubmit={handleSubmit}
          >

            {/* BASIC INFORMATION */}

            <div className="provider-form-section">
              <div className="provider-section-heading">
                <div className="provider-section-number">
                  1
                </div>

                <div>
                  <h2>Basic Information</h2>

                  <p>
                    Enter the main information students will
                    see when browsing scholarships.
                  </p>
                </div>
              </div>

              <div className="provider-form-grid">
                <div className="form-group provider-full-width">
                  <label htmlFor="title">
                    Scholarship Title
                  </label>

                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Engineering Excellence Scholarship"
                    required
                  />
                </div>

                <div className="form-group provider-full-width">
                  <label htmlFor="provider">
                    Scholarship Provider
                  </label>

                  <input
                    id="provider"
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    placeholder="Example Foundation"
                    required
                  />

                  <small>
                    Enter the organization or institution
                    providing this scholarship.
                  </small>
                </div>

                <div className="form-group provider-full-width">
                  <label htmlFor="description">
                    Scholarship Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the scholarship, its purpose and who it is designed to support..."
                    required
                  />

                  <div className="provider-field-helper">
                    <span>
                      Give students a clear overview of the
                      opportunity.
                    </span>

                    <span>
                      {formData.description.length} characters
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="amount">
                    Scholarship Amount (Rs.)
                  </label>

                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    placeholder="150000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="deadline">
                    Application Deadline
                  </label>

                  <input
                    id="deadline"
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="provider-form-divider" />

            {/* ELIGIBILITY DESCRIPTION */}

            <div className="provider-form-section">
              <div className="provider-section-heading">
                <div className="provider-section-number">
                  2
                </div>

                <div>
                  <h2>Eligibility Information</h2>

                  <p>
                    Explain who should apply for this
                    scholarship.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="eligibility">
                  Eligibility Description
                </label>

                <textarea
                  id="eligibility"
                  name="eligibility"
                  rows="5"
                  value={formData.eligibility}
                  onChange={handleChange}
                  placeholder="Example: Undergraduate engineering students with good academic performance."
                  required
                />

                <small>
                  This description will be visible to students
                  on the scholarship details page.
                </small>
              </div>
            </div>

            <div className="provider-form-divider" />

            {/* AUTOMATIC ELIGIBILITY */}

            <div className="provider-form-section">
              <div className="provider-section-heading">
                <div className="provider-section-number">
                  3
                </div>

                <div>
                  <h2>Automatic Eligibility Criteria</h2>

                  <p>
                    These values are used by the system to
                    automatically check student eligibility.
                  </p>
                </div>
              </div>

              <div className="provider-info-box">
                <div>i</div>

                <p>
                  Optional criteria can be left empty. Students
                  will only be checked against the criteria you
                  specify below.
                </p>
              </div>

              <div className="provider-form-grid">
                <div className="form-group">
                  <label htmlFor="minimumGPA">
                    Minimum GPA
                  </label>

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

                  <small>
                    Leave empty if there is no minimum GPA.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="requiredAcademicYear">
                    Required Academic Year
                  </label>

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

                  <small>
                    Choose a year only when the scholarship
                    targets a specific academic year.
                  </small>
                </div>

                <div className="form-group provider-full-width">
                  <label htmlFor="requiredCourse">
                    Required Course / Degree
                  </label>

                  <input
                    id="requiredCourse"
                    type="text"
                    name="requiredCourse"
                    value={formData.requiredCourse}
                    onChange={handleChange}
                    placeholder="Example: Computer Engineering"
                  />

                  <small>
                    Leave empty if students from any course
                    can apply.
                  </small>
                </div>
              </div>
            </div>

            <div className="provider-form-divider" />

            {/* DOCUMENT REQUIREMENTS */}

            <div className="provider-form-section">
              <div className="provider-section-heading">
                <div className="provider-section-number">
                  4
                </div>

                <div>
                  <h2>Required Documents</h2>

                  <p>
                    Tell students which documents should be
                    included with their application.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="requirements">
                  Document Requirements
                </label>

                <textarea
                  id="requirements"
                  name="requirements"
                  rows="4"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Academic Transcript, Student ID, Recommendation Letter"
                />

                <small>
                  Separate each document requirement using a
                  comma.
                </small>
              </div>

              {formData.requirements.trim() && (
                <div className="provider-requirements-preview">
                  <h3>Requirements Preview</h3>

                  <div>
                    {formData.requirements
                      .split(",")
                      .map((requirement) =>
                        requirement.trim()
                      )
                      .filter(
                        (requirement) =>
                          requirement !== ""
                      )
                      .map((requirement, index) => (
                        <span key={index}>
                          ✓ {requirement}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS */}

            <div className="provider-form-actions">
              <Link
                to="/my-scholarships"
                className="btn btn-secondary"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="btn btn-primary provider-create-button"
                disabled={submitting}
              >
                {submitting
                  ? "Creating Scholarship..."
                  : "Create Scholarship"}
              </button>
            </div>
          </form>

          {/* ==================================
              SIDEBAR
              ================================== */}

          <aside className="provider-form-sidebar">
            <section className="provider-guide-card">
              <div className="provider-guide-icon">
                🎓
              </div>

              <h3>Creating a Scholarship</h3>

              <p>
                Provide clear and accurate information so
                students can quickly understand whether the
                opportunity is suitable for them.
              </p>

              <div className="provider-guide-list">
                <div>
                  <span>1</span>
                  <p>Use a clear scholarship title.</p>
                </div>

                <div>
                  <span>2</span>
                  <p>
                    Set realistic eligibility requirements.
                  </p>
                </div>

                <div>
                  <span>3</span>
                  <p>
                    Clearly list all required documents.
                  </p>
                </div>

                <div>
                  <span>4</span>
                  <p>
                    Double-check the application deadline.
                  </p>
                </div>
              </div>
            </section>

            <section className="provider-preview-card">
              <span>Scholarship Preview</span>

              <h3>
                {formData.title ||
                  "Your Scholarship Title"}
              </h3>

              <p>
                {formData.provider ||
                  "Provider Organization"}
              </p>

              <div className="provider-preview-divider" />

              <div>
                <span>Amount</span>

                <strong>
                  {formData.amount
                    ? `Rs. ${Number(
                        formData.amount
                      ).toLocaleString("en-LK")}`
                    : "Not set"}
                </strong>
              </div>

              <div>
                <span>Minimum GPA</span>

                <strong>
                  {formData.minimumGPA ||
                    "Any"}
                </strong>
              </div>

              <div>
                <span>Academic Year</span>

                <strong>
                  {formData.requiredAcademicYear
                    ? `Year ${formData.requiredAcademicYear}`
                    : "Any"}
                </strong>
              </div>

              <div>
                <span>Course</span>

                <strong>
                  {formData.requiredCourse ||
                    "Any course"}
                </strong>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default CreateScholarship;