import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Scholarships() {
  const [scholarships, setScholarships] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // Search and filters

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [selectedYear, setSelectedYear] =
    useState("");

  const [studentGPA, setStudentGPA] =
    useState("");

  // ==========================================
  // GET SCHOLARSHIPS
  // ==========================================

  useEffect(() => {
    const fetchScholarships = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login to view scholarships."
        );

        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/scholarships",
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to load scholarships."
          );

          return;
        }

        setScholarships(
          data.scholarships || []
        );
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

  const filteredScholarships =
    scholarships.filter(
      (scholarship) => {
        const search =
          searchTerm
            .trim()
            .toLowerCase();

        const title = (
          scholarship.title || ""
        ).toLowerCase();

        const provider = (
          scholarship.provider || ""
        ).toLowerCase();

        const matchesSearch =
          title.includes(search) ||
          provider.includes(search);

        const matchesCourse =
          selectedCourse === "" ||
          scholarship.requiredCourse ===
            selectedCourse;

        const matchesYear =
          selectedYear === "" ||
          Number(
            scholarship.requiredAcademicYear
          ) === Number(selectedYear);

        const scholarshipMinimumGPA =
          Number(
            scholarship.minimumGPA
          ) || 0;

        const matchesGPA =
          studentGPA === "" ||
          Number(studentGPA) >=
            scholarshipMinimumGPA;

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

  const filtersActive =
    searchTerm.trim() !== "" ||
    selectedCourse !== "" ||
    selectedYear !== "" ||
    studentGPA !== "";

  // ==========================================
  // FORMAT AMOUNT
  // ==========================================

  const formatAmount = (amount) => {
    const numericAmount =
      Number(amount);

    if (
      Number.isNaN(numericAmount)
    ) {
      return amount;
    }

    return numericAmount.toLocaleString(
      "en-LK"
    );
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

            <h2>
              Finding scholarships
            </h2>

            <p>
              Loading available
              scholarship opportunities...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="student-page">
        <div className="student-container">
          <div className="student-error-card">
            <span>!</span>

            <h2>
              Unable to load scholarships
            </h2>

            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="student-page">
      <div className="student-container">

        {/* HEADER */}

        <div className="student-page-header">
          <div>
            <span className="student-eyebrow">
              Opportunities
            </span>

            <h1>
              Available Scholarships
            </h1>

            <p>
              Explore scholarship
              opportunities and find
              options that match your
              academic profile and goals.
            </p>
          </div>

          <div className="scholarship-count-card">
            <strong>
              {scholarships.length}
            </strong>

            <span>
              Available
            </span>
          </div>
        </div>

        {/* ==================================
            SEARCH & FILTER PANEL
            ================================== */}

        <section className="scholarship-filter-card">

          <div className="filter-card-heading">
            <div>
              <h2>
                Find Your Scholarship
              </h2>

              <p>
                Search and filter
                opportunities based on
                your academic information.
              </p>
            </div>

            {filtersActive && (
              <button
                type="button"
                className="filter-clear-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="scholarship-filter-grid">

            {/* SEARCH */}

            <div className="form-group scholarship-search-field">
              <label htmlFor="scholarshipSearch">
                Search
              </label>

              <div className="search-input-wrapper">
                <span>
                  🔎
                </span>

                <input
                  id="scholarshipSearch"
                  type="text"
                  placeholder="Scholarship or provider..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* COURSE */}

            <div className="form-group">
              <label htmlFor="courseFilter">
                Course
              </label>

              <select
                id="courseFilter"
                value={selectedCourse}
                onChange={(e) =>
                  setSelectedCourse(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All Courses
                </option>

                {courseOptions.map(
                  (course) => (
                    <option
                      key={course}
                      value={course}
                    >
                      {course}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* YEAR */}

            <div className="form-group">
              <label htmlFor="yearFilter">
                Academic Year
              </label>

              <select
                id="yearFilter"
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All Years
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
            </div>

            {/* GPA */}

            <div className="form-group">
              <label htmlFor="gpaFilter">
                Your GPA
              </label>

              <input
                id="gpaFilter"
                type="number"
                min="0"
                max="4"
                step="0.01"
                placeholder="3.50"
                value={studentGPA}
                onChange={(e) =>
                  setStudentGPA(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="filter-footer">
            <p>
              💡 Enter your GPA to hide
              scholarships whose minimum
              GPA requirement you do not
              meet.
            </p>

            <strong>
              {
                filteredScholarships.length
              }{" "}
              result
              {filteredScholarships.length !==
              1
                ? "s"
                : ""}
            </strong>
          </div>
        </section>

        {/* ==================================
            RESULTS HEADING
            ================================== */}

        <div className="scholarship-results-heading">
          <div>
            <h2>
              Scholarship Opportunities
            </h2>

            <p>
              Review the requirements
              before checking your full
              eligibility.
            </p>
          </div>

          {filtersActive && (
            <span>
              {
                filteredScholarships.length
              }{" "}
              of {scholarships.length}
            </span>
          )}
        </div>

        {/* ==================================
            SCHOLARSHIPS
            ================================== */}

        {scholarships.length === 0 ? (
          <div className="scholarship-empty-state">
            <div>🎓</div>

            <h2>
              No scholarships available
            </h2>

            <p>
              There are currently no
              active scholarship
              opportunities.
            </p>
          </div>
        ) : filteredScholarships.length ===
          0 ? (
          <div className="scholarship-empty-state">
            <div>🔎</div>

            <h2>
              No matching scholarships
            </h2>

            <p>
              Try changing or clearing
              your current search
              filters.
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="scholarship-grid">
            {filteredScholarships.map(
              (scholarship) => (
                <article
                  className="scholarship-card"
                  key={scholarship._id}
                >
                  <div className="scholarship-card-top">
                    <div className="scholarship-card-icon">
                      🎓
                    </div>

                    <span className="scholarship-active-badge">
                      Active
                    </span>
                  </div>

                  <div className="scholarship-card-content">
                    <p className="scholarship-provider">
                      {
                        scholarship.provider
                      }
                    </p>

                    <h2>
                      {
                        scholarship.title
                      }
                    </h2>

                    <p className="scholarship-description">
                      {
                        scholarship.description
                      }
                    </p>

                    <div className="scholarship-amount">
                      <span>
                        Scholarship Amount
                      </span>

                      <strong>
                        Rs.{" "}
                        {formatAmount(
                          scholarship.amount
                        )}
                      </strong>
                    </div>

                    <div className="scholarship-meta-grid">
                      <div>
                        <span>
                          Deadline
                        </span>

                        <strong>
                          {new Date(
                            scholarship.deadline
                          ).toLocaleDateString()}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Minimum GPA
                        </span>

                        <strong>
                          {Number(
                            scholarship.minimumGPA
                          ) > 0
                            ? Number(
                                scholarship.minimumGPA
                              ).toFixed(
                                2
                              )
                            : "Any"}
                        </strong>
                      </div>
                    </div>

                    <div className="scholarship-tags">
                      {scholarship.requiredCourse && (
                        <span>
                          {
                            scholarship.requiredCourse
                          }
                        </span>
                      )}

                      {scholarship.requiredAcademicYear && (
                        <span>
                          Year{" "}
                          {
                            scholarship.requiredAcademicYear
                          }
                        </span>
                      )}

                      {!scholarship.requiredCourse &&
                        !scholarship.requiredAcademicYear && (
                          <span>
                            Open Criteria
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="scholarship-card-footer">
                    <Link
                      to={`/scholarships/${scholarship._id}`}
                      className="btn btn-primary scholarship-view-button"
                    >
                      View Details
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default Scholarships;