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
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main>
        <h1>My Profile</h1>
        <p>Loading profile...</p>
      </main>
    );
  }

  // ==========================================
  // PROFILE PAGE
  // ==========================================

  return (
    <main>
      <section>
        <h1>My Profile</h1>

        <p>
          Manage your academic information for
          scholarship applications.
        </p>

        {message && <p>{message}</p>}

        {error && <p>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Full Name</label>
            <br />

            <input
              type="text"
              value={formData.fullName}
              disabled
            />
          </div>

          <br />

          <div>
            <label>Email</label>
            <br />

            <input
              type="email"
              value={formData.email}
              disabled
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
              placeholder="University of Ruhuna"
              required
            />
          </div>

          <br />

          <div>
            <label>Degree / Course</label>
            <br />

            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="Computer Engineering"
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
            <label>GPA</label>
            <br />

            <input
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
          </div>

          <br />

          <button type="submit">
            Save Profile
          </button>
        </form>
      </section>
    </main>
  );
}

export default StudentProfile;