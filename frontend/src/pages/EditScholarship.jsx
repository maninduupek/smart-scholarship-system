import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

    setMessage("");
    setError("");
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

    if (
      formData.minimumGPA !== "" &&
      (Number(formData.minimumGPA) < 0 ||
        Number(formData.minimumGPA) > 4)
    ) {
      setError(
        "Minimum GPA must be between 0 and 4."
      );
      return;
    }

    const requirementsArray =
      formData.requirements
        .split(",")
        .map((requirement) =>
          requirement.trim()
        )
        .filter(
          (requirement) =>
            requirement !== ""
        );

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
                : Number(
                    formData.minimumGPA
                  ),

            requiredAcademicYear:
              formData.requiredAcademicYear ===
              ""
                ? null
                : Number(
                    formData.requiredAcademicYear
                  ),

            requiredCourse:
              formData.requiredCourse.trim(),

            requirements:
              requirementsArray,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update scholarship."
        );
        return;
      }

      setMessage(
        "Scholarship updated successfully!"
      );

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
      <main className="provider-page">
        <div className="provider-container">
          <div className="student-loading-card">
            <div className="student-spinner" />

            <h2>
              Loading scholarship
            </h2>

            <p>
              Preparing the scholarship
              information for editing...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // LOAD ERROR
  // ==========================================

  if (error && !formData.title) {
    return (
      <main className="provider-page">
        <div className="provider-container">
          <div className="student-error-card">
            <span>!</span>

            <h2>
              Unable to load scholarship
            </h2>

            <p>{error}</p>

            <Link
              to="/my-scholarships"
              className="btn btn-secondary"
            >
              Back to My Scholarships
            </Link>
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

        {/* BREADCRUMB */}

        <div className="provider-breadcrumb">
          <Link to="/my-scholarships">
            My Scholarships
          </Link>

          <span>›</span>

          <span>Edit Scholarship</span>
        </div>

        {/* HEADER */}

        <div className="provider-page-header">
          <div>
            <span className="provider-eyebrow">
              Scholarship Management
            </span>

            <h1>Edit Scholarship</h1>

            <p>
              Update scholarship
              information, eligibility
              criteria and required
              documents.
            </p>
          </div>

          <Link
            to={`/scholarships/${id}`}
            className="btn btn-secondary"
          >
            View Scholarship
          </Link>
        </div>

        {/* SUCCESS */}

        {message && (
          <div className="provider-success-message">
            <div className="provider-message-icon">
              ✓
            </div>

            <div>
              <strong>
                Changes Saved
              </strong>

              <p>{message}</p>

              <span>
                Redirecting to your
                scholarships...
              </span>
            </div>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="alert alert-error">
            <strong>
              Unable to save changes
            </strong>

            <span>{error}</span>
          </div>
        )}

        <div className="provider-form-layout">

          {/* MAIN FORM */}

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
                  <h2>
                    Basic Information
                  </h2>

                  <p>
                    Update the information
                    students see when
                    browsing this
                    scholarship.
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
                    required
                  />
                </div>

                <div className="form-group provider-full-width">
                  <label htmlFor="provider">
                    Provider /
                    Organization Name
                  </label>

                  <input
                    id="provider"
                    type="text"
                    name="provider"
                    value={
                      formData.provider
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group provider-full-width">
                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows="6"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    required
                  />

                  <div className="provider-field-helper">
                    <span>
                      Explain the purpose
                      and benefits of this
                      scholarship.
                    </span>

                    <span>
                      {
                        formData.description
                          .length
                      }{" "}
                      characters
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="amount">
                    Scholarship Amount
                    (Rs.)
                  </label>

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

                <div className="form-group">
                  <label htmlFor="deadline">
                    Application Deadline
                  </label>

                  <input
                    id="deadline"
                    type="date"
                    name="deadline"
                    value={
                      formData.deadline
                    }
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
                  <h2>
                    Eligibility Information
                  </h2>

                  <p>
                    Update the general
                    eligibility information
                    shown to students.
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
                  value={
                    formData.eligibility
                  }
                  onChange={handleChange}
                  required
                />

                <small>
                  Example: Second-year
                  Computer Engineering
                  students with a GPA of
                  at least 3.00.
                </small>
              </div>
            </div>

            <div className="provider-form-divider" />

            {/* STRUCTURED ELIGIBILITY */}

            <div className="provider-form-section">
              <div className="provider-section-heading">
                <div className="provider-section-number">
                  3
                </div>

                <div>
                  <h2>
                    Automatic Eligibility
                    Criteria
                  </h2>

                  <p>
                    These criteria are used
                    by the system to
                    automatically check
                    students.
                  </p>
                </div>
              </div>

              <div className="provider-info-box">
                <div>i</div>

                <p>
                  Leave optional criteria
                  empty when they should
                  not restrict student
                  eligibility.
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
                    value={
                      formData.minimumGPA
                    }
                    onChange={handleChange}
                    min="0"
                    max="4"
                    step="0.01"
                    placeholder="Example: 3.00"
                  />

                  <small>
                    Leave empty if there is
                    no minimum GPA
                    requirement.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="requiredAcademicYear">
                    Required Academic Year
                  </label>

                  <select
                    id="requiredAcademicYear"
                    name="requiredAcademicYear"
                    value={
                      formData.requiredAcademicYear
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Any Academic Year
                    </option>

                    <option value="1">
                      Year 1
                    </option>

                    <option value="2">
                      Year 2
                    </option>

                    <option value="3">
                      Year 3
                    </option>

                    <option value="4">
                      Year 4
                    </option>

                    <option value="5">
                      Year 5
                    </option>

                    <option value="6">
                      Year 6
                    </option>
                  </select>

                  <small>
                    Select a year only when
                    the scholarship targets
                    a specific academic
                    year.
                  </small>
                </div>

                <div className="form-group provider-full-width">
                  <label htmlFor="requiredCourse">
                    Required Course /
                    Degree
                  </label>

                  <input
                    id="requiredCourse"
                    type="text"
                    name="requiredCourse"
                    value={
                      formData.requiredCourse
                    }
                    onChange={handleChange}
                    placeholder="Example: Computer Engineering"
                  />

                  <small>
                    Leave empty if students
                    from any course can
                    apply.
                  </small>
                </div>
              </div>
            </div>

            <div className="provider-form-divider" />

            {/* REQUIREMENTS */}

            <div className="provider-form-section">
              <div className="provider-section-heading">
                <div className="provider-section-number">
                  4
                </div>

                <div>
                  <h2>
                    Required Documents
                  </h2>

                  <p>
                    Update the supporting
                    documents students
                    should submit.
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
                  value={
                    formData.requirements
                  }
                  onChange={handleChange}
                  placeholder="Academic Transcript, Student ID, Recommendation Letter"
                />

                <small>
                  Separate each requirement
                  using a comma.
                </small>
              </div>

              {formData.requirements.trim() && (
                <div className="provider-requirements-preview">
                  <h3>
                    Requirements Preview
                  </h3>

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
                      .map(
                        (
                          requirement,
                          index
                        ) => (
                          <span key={index}>
                            ✓ {requirement}
                          </span>
                        )
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS */}

            <div className="provider-form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  navigate(
                    "/my-scholarships"
                  )
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary provider-create-button"
                disabled={saving}
              >
                {saving
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>
            </div>
          </form>

          {/* SIDEBAR */}

          <aside className="provider-form-sidebar">

            <section className="provider-guide-card">
              <div className="provider-guide-icon">
                ✎
              </div>

              <h3>
                Editing Scholarship
              </h3>

              <p>
                Changes saved here will
                update the scholarship
                information students see
                throughout the system.
              </p>

              <div className="provider-guide-list">
                <div>
                  <span>1</span>

                  <p>
                    Review the scholarship
                    amount and deadline.
                  </p>
                </div>

                <div>
                  <span>2</span>

                  <p>
                    Make sure eligibility
                    criteria are accurate.
                  </p>
                </div>

                <div>
                  <span>3</span>

                  <p>
                    Check the required
                    documents carefully.
                  </p>
                </div>

                <div>
                  <span>4</span>

                  <p>
                    Save your changes
                    before leaving.
                  </p>
                </div>
              </div>
            </section>

            {/* LIVE PREVIEW */}

            <section className="provider-preview-card">
              <span>
                Current Preview
              </span>

              <h3>
                {formData.title ||
                  "Scholarship Title"}
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
                      ).toLocaleString(
                        "en-LK"
                      )}`
                    : "Not set"}
                </strong>
              </div>

              <div>
                <span>
                  Minimum GPA
                </span>

                <strong>
                  {formData.minimumGPA ||
                    "Any"}
                </strong>
              </div>

              <div>
                <span>
                  Academic Year
                </span>

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

              <div>
                <span>Deadline</span>

                <strong>
                  {formData.deadline
                    ? new Date(
                        `${formData.deadline}T00:00:00`
                      ).toLocaleDateString()
                    : "Not set"}
                </strong>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default EditScholarship;