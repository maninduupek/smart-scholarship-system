import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalProviders: 0,
    totalScholarships: 0,
    activeScholarships: 0,
    closedScholarships: 0,
    totalApplications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ADMIN DASHBOARD
  // ==========================================

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as an admin.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard",
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
            data.message ||
              "Failed to load admin dashboard."
          );
          return;
        }

        setStatistics(data.statistics);
      } catch (error) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ==========================================
  // CALCULATED VALUES
  // ==========================================

  const scholarshipActivity =
    statistics.totalScholarships > 0
      ? Math.round(
          (statistics.activeScholarships /
            statistics.totalScholarships) *
            100
        )
      : 0;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <div className="student-loading-card">
            <div className="student-spinner" />

            <h2>Loading admin dashboard</h2>

            <p>
              Retrieving the latest system
              statistics...
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
      <main className="admin-page">
        <div className="admin-container">
          <div className="student-error-card">
            <span>!</span>

            <h2>
              Unable to load dashboard
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
    <main className="admin-page">
      <div className="admin-container">

        {/* HEADER */}

        <section className="admin-dashboard-header">
          <div>
            <span className="admin-eyebrow">
              Administration
            </span>

            <h1>Admin Dashboard</h1>

            <p>
              Monitor users, scholarships and
              applications across the Smart
              Scholarship Application and
              Management System.
            </p>
          </div>

          <div className="admin-header-badge">
            <span className="admin-online-dot" />

            System Overview
          </div>
        </section>

        {/* PRIMARY STATISTICS */}

        <section className="admin-primary-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              👥
            </div>

            <div>
              <span>Total Users</span>

              <strong>
                {statistics.totalUsers}
              </strong>

              <p>
                Registered accounts
              </p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              🎓
            </div>

            <div>
              <span>Scholarships</span>

              <strong>
                {statistics.totalScholarships}
              </strong>

              <p>
                Total opportunities
              </p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              📄
            </div>

            <div>
              <span>Applications</span>

              <strong>
                {statistics.totalApplications}
              </strong>

              <p>
                Student submissions
              </p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon admin-stat-icon-active">
              ✓
            </div>

            <div>
              <span>Active Scholarships</span>

              <strong>
                {statistics.activeScholarships}
              </strong>

              <p>
                Currently available
              </p>
            </div>
          </div>
        </section>

        {/* DASHBOARD GRID */}

        <section className="admin-dashboard-grid">

          {/* USER OVERVIEW */}

          <div className="admin-dashboard-card">
            <div className="admin-card-heading">
              <div>
                <h2>User Overview</h2>

                <p>
                  Registered users by role
                </p>
              </div>

              <Link to="/admin/users">
                Manage Users →
              </Link>
            </div>

            <div className="admin-role-list">
              <div className="admin-role-row">
                <div className="admin-role-info">
                  <span className="admin-role-icon">
                    🎓
                  </span>

                  <div>
                    <strong>
                      Students
                    </strong>

                    <p>
                      Scholarship applicants
                    </p>
                  </div>
                </div>

                <strong className="admin-role-count">
                  {statistics.totalStudents}
                </strong>
              </div>

              <div className="admin-role-row">
                <div className="admin-role-info">
                  <span className="admin-role-icon">
                    🏢
                  </span>

                  <div>
                    <strong>
                      Providers
                    </strong>

                    <p>
                      Scholarship organizations
                    </p>
                  </div>
                </div>

                <strong className="admin-role-count">
                  {statistics.totalProviders}
                </strong>
              </div>
            </div>

            <div className="admin-user-total">
              <span>
                Total registered users
              </span>

              <strong>
                {statistics.totalUsers}
              </strong>
            </div>
          </div>

          {/* SCHOLARSHIP OVERVIEW */}

          <div className="admin-dashboard-card">
            <div className="admin-card-heading">
              <div>
                <h2>
                  Scholarship Overview
                </h2>

                <p>
                  Current scholarship status
                </p>
              </div>

              <Link to="/scholarships">
                View Scholarships →
              </Link>
            </div>

            <div className="admin-scholarship-summary">
              <div>
                <span className="admin-summary-dot admin-summary-active" />

                <div>
                  <strong>
                    {statistics.activeScholarships}
                  </strong>

                  <p>
                    Active Scholarships
                  </p>
                </div>
              </div>

              <div>
                <span className="admin-summary-dot admin-summary-closed" />

                <div>
                  <strong>
                    {statistics.closedScholarships}
                  </strong>

                  <p>
                    Closed Scholarships
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-progress-section">
              <div className="admin-progress-heading">
                <span>
                  Active scholarship rate
                </span>

                <strong>
                  {scholarshipActivity}%
                </strong>
              </div>

              <div className="admin-progress-track">
                <div
                  className="admin-progress-bar"
                  style={{
                    width: `${scholarshipActivity}%`,
                  }}
                />
              </div>

              <p>
                {statistics.activeScholarships} of{" "}
                {statistics.totalScholarships}{" "}
                scholarships are currently
                active.
              </p>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}

        <section className="admin-dashboard-card admin-quick-actions">
          <div className="admin-card-heading">
            <div>
              <h2>
                Management Shortcuts
              </h2>

              <p>
                Quickly access common
                administration areas
              </p>
            </div>
          </div>

          <div className="admin-action-grid">
            <Link
              to="/admin/users"
              className="admin-action-card"
            >
              <div>👥</div>

              <section>
                <strong>
                  Manage Users
                </strong>

                <p>
                  Review registered students
                  and providers.
                </p>
              </section>

              <span>→</span>
            </Link>

            <Link
              to="/scholarships"
              className="admin-action-card"
            >
              <div>🎓</div>

              <section>
                <strong>
                  View Scholarships
                </strong>

                <p>
                  Review scholarship
                  opportunities.
                </p>
              </section>

              <span>→</span>
            </Link>

            <Link
              to="/my-scholarships"
              className="admin-action-card"
            >
              <div>⚙️</div>

              <section>
                <strong>
                  Manage Scholarships
                </strong>

                <p>
                  Access scholarship
                  management controls.
                </p>
              </section>

              <span>→</span>
            </Link>

            <Link
              to="/provider-applications"
              className="admin-action-card"
            >
              <div>📄</div>

              <section>
                <strong>
                  Applications
                </strong>

                <p>
                  Review scholarship
                  applications.
                </p>
              </section>

              <span>→</span>
            </Link>
          </div>
        </section>

        {/* SYSTEM SUMMARY */}

        <section className="admin-system-summary">
          <div>
            <span className="admin-online-dot" />

            <div>
              <strong>
                Scholarship Management System
              </strong>

              <p>
                Administrative overview loaded
                successfully.
              </p>
            </div>
          </div>

          <span>
            {statistics.totalUsers} users ·{" "}
            {statistics.totalScholarships} scholarships ·{" "}
            {statistics.totalApplications} applications
          </span>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;