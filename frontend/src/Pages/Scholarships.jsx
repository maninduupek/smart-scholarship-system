import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [studentGPA, setStudentGPA] = useState("");

  // ==========================================
  // GET SCHOLARSHIPS
  // ==========================================

  useEffect(() => {
    const fetchScholarships = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view scholarships.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/scholarships",
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
            data.message || "Failed to load scholarships."
          );
          return;
        }

        setScholarships(data.scholarships);
      } catch (error) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  // ==========================================
  // CREATE COURSE FILTER OPTIONS
  // ==========================================

  const courseOptions = [
    ...new Set(
      scholarships
        .map((scholarship) =>
          scholarship.requiredCourse?.trim()
        )
        .filter(Boolean)
    ),
  ];

  // ==========================================
  // FILTER SCHOLARSHIPS
  // ==========================================

  const filteredScholarships = scholarships.filter(
    (scholarship) => {
      // SEARCH
      const search = searchTerm.trim().toLowerCase();

      const title = (
        scholarship.title || ""
      ).toLowerCase();

      const provider = (
        scholarship.provider || ""
      ).toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        provider.includes(search);

      // COURSE
      const matchesCourse =
        selectedCourse === "" ||
        scholarship.requiredCourse === selectedCourse;

      // ACADEMIC YEAR
      const matchesYear =
        selectedYear === "" ||
        Number(scholarship.requiredAcademicYear) ===
          Number(selectedYear);

      // GPA
      const scholarshipMinimumGPA =
        Number(scholarship.minimumGPA) || 0;

      const matchesGPA =
        studentGPA === "" ||
        Number(studentGPA) >= scholarshipMinimumGPA;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesYear &&
        matchesGPA
      );
    }
  );

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCourse("");
    setSelectedYear("");
    setStudentGPA("");
  };

  // ==========================================
  // CHECK ACTIVE FILTERS
  // ==========================================

  const filtersActive =
    searchTerm.trim() !== "" ||
    selectedCourse !== "" ||
    selectedYear !== "" ||
    studentGPA !== "";

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main>
        <h1>Available Scholarships</h1>
        <p>Loading scholarships...</p>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main>
        <h1>Available Scholarships</h1>
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
        <h1>Available Scholarships</h1>

        <p>
          Explore scholarships and find opportunities
          that match your goals.
        </p>

        {/* SEARCH */}

        <div>
          <label htmlFor="scholarshipSearch">
            <strong>Search Scholarships</strong>
          </label>

          <br />

          <input
            id="scholarshipSearch"
            type="text"
            placeholder="Search by scholarship or provider..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <br />

        {/* COURSE FILTER */}

        <div>
          <label htmlFor="courseFilter">
            <strong>Course</strong>
          </label>

          <br />

          <select
            id="courseFilter"
            value={selectedCourse}
            onChange={(e) =>
              setSelectedCourse(e.target.value)
            }
          >
            <option value="">
              All Courses
            </option>

            {courseOptions.map((course) => (
              <option
                key={course}
                value={course}
              >
                {course}
              </option>
            ))}
          </select>
        </div>

        <br />

        {/* ACADEMIC YEAR FILTER */}

        <div>
          <label htmlFor="yearFilter">
            <strong>Academic Year</strong>
          </label>

          <br />

          <select
            id="yearFilter"
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(e.target.value)
            }
          >
            <option value="">
              All Years
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

        {/* GPA FILTER */}

        <div>
          <label htmlFor="gpaFilter">
            <strong>Student GPA</strong>
          </label>

          <br />

          <input
            id="gpaFilter"
            type="number"
            min="0"
            max="4"
            step="0.01"
            placeholder="Example: 3.50"
            value={studentGPA}
            onChange={(e) =>
              setStudentGPA(e.target.value)
            }
          />

          <p>
            Enter your GPA to show scholarships whose
            minimum GPA requirement you meet.
          </p>
        </div>

        {/* CLEAR FILTERS */}

        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}

        <br />

        {/* RESULT COUNT */}

        {filtersActive && (
          <p>
            <strong>
              {filteredScholarships.length}
            </strong>{" "}
            scholarship
            {filteredScholarships.length !== 1
              ? "s"
              : ""}{" "}
            found.
          </p>
        )}

        {/* SCHOLARSHIPS */}

        {scholarships.length === 0 ? (
          <p>
            No scholarships are currently available.
          </p>
        ) : filteredScholarships.length === 0 ? (
          <p>
            No scholarships match your search or
            selected filters.
          </p>
        ) : (
          <div>
            {filteredScholarships.map(
              (scholarship) => (
                <div key={scholarship._id}>
                  <h2>
                    {scholarship.title}
                  </h2>

                  <h3>
                    {scholarship.provider}
                  </h3>

                  <p>
                    {scholarship.description}
                  </p>

                  <p>
                    <strong>Amount:</strong>{" "}
                    Rs. {scholarship.amount}
                  </p>

                  <p>
                    <strong>Deadline:</strong>{" "}
                    {new Date(
                      scholarship.deadline
                    ).toLocaleDateString()}
                  </p>

                  {/* COURSE */}

                  {scholarship.requiredCourse && (
                    <p>
                      <strong>
                        Required Course:
                      </strong>{" "}
                      {scholarship.requiredCourse}
                    </p>
                  )}

                  {/* ACADEMIC YEAR */}

                  {scholarship.requiredAcademicYear && (
                    <p>
                      <strong>
                        Required Academic Year:
                      </strong>{" "}
                      Year{" "}
                      {
                        scholarship.requiredAcademicYear
                      }
                    </p>
                  )}

                  {/* MINIMUM GPA */}

                  <p>
                    <strong>
                      Minimum GPA:
                    </strong>{" "}
                    {Number(
                      scholarship.minimumGPA
                    ) > 0
                      ? Number(
                          scholarship.minimumGPA
                        ).toFixed(2)
                      : "No minimum GPA"}
                  </p>

                  <Link
                    to={`/scholarships/${scholarship._id}`}
                  >
                    <button type="button">
                      View Details
                    </button>
                  </Link>

                  <hr />
                </div>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Scholarships;