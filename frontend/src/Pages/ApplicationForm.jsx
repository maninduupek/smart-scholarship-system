import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ApplicationForm() {
  const { id } = useParams();

  const [scholarship, setScholarship] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      university: "",
      course: "",
      academicYear: "",
      statement: "",
    });

  const [documents, setDocuments] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD SCHOLARSHIP + STUDENT PROFILE
  // ==========================================

  useEffect(() => {
    const loadApplicationData = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login to apply for a scholarship."
        );

        setLoading(false);
        return;
      }

      try {
        // ======================================
        // LOAD SCHOLARSHIP
        // ======================================

        const scholarshipResponse =
          await fetch(
            `http://localhost:5000/api/scholarships/${id}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const scholarshipData =
          await scholarshipResponse.json();

        if (!scholarshipResponse.ok) {
          setError(
            scholarshipData.message ||
              "Failed to load scholarship."
          );

          setLoading(false);
          return;
        }

        setScholarship(
          scholarshipData.scholarship
        );

        // ======================================
        // LOAD STUDENT PROFILE
        // ======================================

        const profileResponse =
          await fetch(
            "http://localhost:5000/api/student/profile",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const profileData =
          await profileResponse.json();

        if (!profileResponse.ok) {
          setError(
            profileData.message ||
              "Failed to load student profile."
          );

          setLoading(false);
          return;
        }

        setFormData({
          fullName:
            profileData.user?.fullName || "",

          email:
            profileData.user?.email || "",

          university:
            profileData.profile?.university ||
            "",

          course:
            profileData.profile?.course || "",

          academicYear:
            profileData.profile
              ?.academicYear || "",

          statement: "",
        });
      } catch (error) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplicationData();
  }, [id]);

  // ==========================================
  // TEXT INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  // ==========================================
  // DOCUMENT SELECTION
  // ==========================================

  const handleDocumentChange = (e) => {
    setError("");

    const selectedFiles =
      Array.from(e.target.files);

    // Maximum 5 documents
    if (selectedFiles.length > 5) {
      setError(
        "You can upload a maximum of 5 documents."
      );

      e.target.value = "";
      setDocuments([]);

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    for (const file of selectedFiles) {
      // Check file type
      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        setError(
          "Only PDF, JPG and PNG files are allowed."
        );

        e.target.value = "";
        setDocuments([]);

        return;
      }

      // Check file size - 5 MB
      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          `${file.name} is larger than 5 MB.`
        );

        e.target.value = "";
        setDocuments([]);

        return;
      }
    }

    setDocuments(selectedFiles);
  };

  // ==========================================
  // SUBMIT APPLICATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login before submitting an application."
      );

      return;
    }

    if (
      !formData.statement.trim()
    ) {
      setError(
        "Please enter your statement of purpose."
      );

      return;
    }

    setSubmitting(true);

    try {
      // ======================================
      // CREATE MULTIPART FORM DATA
      // ======================================

      const applicationData =
        new FormData();

      applicationData.append(
        "scholarshipId",
        id
      );

      applicationData.append(
        "statement",
        formData.statement
      );

      // Add every selected document
      documents.forEach((file) => {
        applicationData.append(
          "documents",
          file
        );
      });

      // ======================================
      // SEND APPLICATION
      // ======================================

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: applicationData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to submit application."
        );

        return;
      }

      setMessage(
        "Application submitted successfully!"
      );

      // Keep profile information,
      // but clear statement + documents
      setFormData(
        (previousData) => ({
          ...previousData,
          statement: "",
        })
      );

      setDocuments([]);

      const fileInput =
        document.getElementById(
          "applicationDocuments"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main>
        <h1>
          Scholarship Application
        </h1>

        <p>
          Loading application...
        </p>
      </main>
    );
  }

  // ==========================================
  // SCHOLARSHIP NOT FOUND
  // ==========================================

  if (!scholarship) {
    return (
      <main>
        <h1>
          Scholarship Application
        </h1>

        <p>
          {error ||
            "Scholarship not found."}
        </p>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main>
      <section>
        <h1>
          Apply for Scholarship
        </h1>

        <h2>
          {scholarship.title}
        </h2>

        <p>
          <strong>
            Provider:
          </strong>{" "}
          {scholarship.provider}
        </p>

        <p>
          <strong>
            Deadline:
          </strong>{" "}
          {new Date(
            scholarship.deadline
          ).toLocaleDateString()}
        </p>

        <hr />

        <h2>
          Application Form
        </h2>

        {message && (
          <p>{message}</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        <form
          onSubmit={handleSubmit}
        >
          {/* FULL NAME */}

          <div>
            <label>
              Full Name
            </label>

            <br />

            <input
              type="text"
              value={
                formData.fullName
              }
              disabled
            />
          </div>

          <br />

          {/* EMAIL */}

          <div>
            <label>
              Email
            </label>

            <br />

            <input
              type="email"
              value={formData.email}
              disabled
            />
          </div>

          <br />

          {/* UNIVERSITY */}

          <div>
            <label>
              University
            </label>

            <br />

            <input
              type="text"
              value={
                formData.university
              }
              disabled
            />
          </div>

          <br />

          {/* COURSE */}

          <div>
            <label>
              Course
            </label>

            <br />

            <input
              type="text"
              value={
                formData.course
              }
              disabled
            />
          </div>

          <br />

          {/* ACADEMIC YEAR */}

          <div>
            <label>
              Academic Year
            </label>

            <br />

            <input
              type="number"
              value={
                formData.academicYear
              }
              disabled
            />
          </div>

          <br />

          {/* STATEMENT */}

          <div>
            <label htmlFor="statement">
              Statement of Purpose
            </label>

            <br />

            <textarea
              id="statement"
              name="statement"
              value={
                formData.statement
              }
              onChange={
                handleChange
              }
              rows="6"
              required
              placeholder="Explain why you are applying for this scholarship..."
            />
          </div>

          <br />

          {/* REQUIRED DOCUMENTS */}

          <div>
            <h3>
              Required Documents
            </h3>

            {scholarship
              .requirements &&
            scholarship.requirements
              .length > 0 ? (
              <ul>
                {scholarship.requirements.map(
                  (
                    requirement,
                    index
                  ) => (
                    <li
                      key={index}
                    >
                      {
                        requirement
                      }
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                No specific
                documents listed by
                the provider.
              </p>
            )}
          </div>

          {/* DOCUMENT UPLOAD */}

          <div>
            <label
              htmlFor="applicationDocuments"
            >
              Upload Documents
            </label>

            <br />

            <input
              id="applicationDocuments"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={
                handleDocumentChange
              }
            />

            <p>
              Maximum 5 files.
              PDF, JPG or PNG only.
              Maximum 5 MB per file.
            </p>
          </div>

          {/* SELECTED DOCUMENTS */}

          {documents.length >
            0 && (
            <div>
              <h4>
                Selected Documents
              </h4>

              <ul>
                {documents.map(
                  (
                    file,
                    index
                  ) => (
                    <li
                      key={index}
                    >
                      {file.name}{" "}
                      (
                      {(
                        file.size /
                        1024 /
                        1024
                      ).toFixed(
                        2
                      )}{" "}
                      MB)
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <br />

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Application"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ApplicationForm;