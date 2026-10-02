import { useEffect, useState } from "react";

function StudentProfile() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    course: "",
    academicYear: "",
    gpa: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD STUDENT PROFILE
  // ==========================================

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/student/profile",
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
            data.message || "Failed to load student profile."
          );
          return;
        }

        setFormData({
          fullName: data.user?.fullName || "",
          email: data.user?.email || "",
          university: data.profile?.university || "",
          course: data.profile?.course || "",
          academicYear:
            data.profile?.academicYear || "",
          gpa: data.profile?.gpa ?? "",
        });
      } catch (error) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
  // SAVE / UPDATE PROFILE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to save your profile.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/student/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            university: formData.university,
            course: formData.course,
            academicYear: Number(
              formData.academicYear
            ),
            gpa: Number(formData.gpa),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to save profile."
        );
        return;
      }

      setMessage(
        "Student profile saved successfully!"
      );
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
      <main className="student-page">
        <div className="student-container">
          <div className="student-loading-card">
            <div className="student-spinner" />
            <h2>Loading your profile</h2>
            <p>
              Please wait while we retrieve your
              academic information.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // PROFILE PAGE
  // ==========================================

  return (
    <main className="student-page">
      <div className="student-container">

        {/* HEADER */}

        <div className="student-page-header">
          <div>
            <span className="student-eyebrow">
              Student Account
            </span>

            <h1>My Academic Profile</h1>

            <p>
              Keep your academic information up to
              date so we can accurately check your
              scholarship eligibility.
            </p>
          </div>

          <div className="profile-header-icon">
            🎓
          </div>
        </div>

        {/* MESSAGES */}

        {message && (
          <div className="alert alert-success">
            <strong>✓ Profile Updated</strong>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <strong>Unable to continue</strong>
            <span>{error}</span>
          </div>
        )}

        <div className="profile-layout">

          {/* LEFT INFORMATION */}

          <aside className="profile-summary-card">
            <div className="profile-avatar">
              {formData.fullName
                ? formData.fullName
                    .charAt(0)
                    .toUpperCase()
                : "S"}
            </div>

            <h2>
              {formData.fullName || "Student"}
            </h2>

            <p className="profile-email">
              {formData.email}
            </p>

            <div className="profile-summary-divider" />

            <div className="profile-summary-item">
              <span>University</span>
              <strong>
                {formData.university ||
                  "Not added yet"}
              </strong>
            </div>

            <div className="profile-summary-item">
              <span>Course</span>
              <strong>
                {formData.course ||
                  "Not added yet"}
              </strong>
            </div>

            <div className="profile-summary-grid">
              <div>
                <span>Year</span>
                <strong>
                  {formData.academicYear
                    ? `Year ${formData.academicYear}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>GPA</span>
                <strong>
                  {formData.gpa !== ""
                    ? Number(
                        formData.gpa
                      ).toFixed(2)
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="profile-tip">
              <span>💡</span>

              <p>
                Scholarship eligibility is checked
                using the academic information
                saved here.
              </p>
            </div>
          </aside>

          {/* PROFILE FORM */}

          <section className="profile-form-card">
            <div className="profile-card-heading">
              <div>
                <h2>Profile Information</h2>
                <p>
                  Your name and email come from
                  your registered account.
                </p>
              </div>

              <span className="profile-status-badge">
                Student
              </span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="profile-form"
            >
              <div className="profile-form-grid">

                <div className="form-group">
                  <label htmlFor="profileFullName">
                    Full Name
                  </label>

                  <input
                    id="profileFullName"
                    type="text"
                    value={formData.fullName}
                    disabled
                  />

                  <small>
                    Registered account information
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="profileEmail">
                    Email Address
                  </label>

                  <input
                    id="profileEmail"
                    type="email"
                    value={formData.email}
                    disabled
                  />

                  <small>
                    Registered account information
                  </small>
                </div>

                <div className="form-group profile-full-field">
                  <label htmlFor="university">
                    University
                  </label>

                  <input
                    id="university"
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="University of Ruhuna"
                    required
                  />
                </div>

                <div className="form-group profile-full-field">
                  <label htmlFor="course">
                    Degree / Course
                  </label>

                  <input
                    id="course"
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="Computer Engineering"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="academicYear">
                    Academic Year
                  </label>

                  <select
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select year
                    </option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                    <option value="6">Year 6</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="gpa">
                    Current GPA
                  </label>

                  <input
                    id="gpa"
                    type="number"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    min="0"
                    max="4"
                    step="0.01"
                    placeholder="3.50"
                    required
                  />

                  <small>
                    Enter a value between 0.00
                    and 4.00
                  </small>
                </div>
              </div>

              <div className="profile-form-footer">
                <p>
                  Make sure your information is
                  accurate before checking
                  scholarship eligibility.
                </p>

                <button
                  type="submit"
                  className="btn btn-primary profile-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default StudentProfile;