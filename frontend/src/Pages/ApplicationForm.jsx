import { useState } from "react";
import { useParams } from "react-router-dom";

function ApplicationForm() {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    course: "",
    academicYear: "",
    statement: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const scholarships = {
    1: {
      title: "University Excellence Scholarship",
      provider: "ABC Foundation",
    },
    2: {
      title: "Future Leaders Scholarship",
      provider: "XYZ Organization",
    },
    3: {
      title: "Technology Scholarship",
      provider: "Tech Foundation",
    },
  };

  const scholarship = scholarships[id];

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Application submitted:", formData);

    setSubmitted(true);
  };

  return (
    <main>
      <section>
        {scholarship ? (
          <>
            <h1>Apply for Scholarship</h1>

            <h2>{scholarship.title}</h2>

            <p>Provided by: {scholarship.provider}</p>

            {submitted && (
              <p>Application submitted successfully!</p>
            )}

            <form onSubmit={handleSubmit}>
              <div>
                <label>Full Name</label>

                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Email</label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>University</label>

                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      university: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Course</label>

                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      course: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Academic Year</label>

                <input
                  type="number"
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicYear: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Statement of Purpose</label>

                <textarea
                  rows="5"
                  value={formData.statement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      statement: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <button type="submit">
                Submit Application
              </button>
            </form>
          </>
        ) : (
          <h1>Scholarship Not Found</h1>
        )}
      </section>
    </main>
  );
}

export default ApplicationForm;