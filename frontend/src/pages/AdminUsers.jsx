import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as an admin.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/users",
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
            data.message || "Failed to load users."
          );
          return;
        }

        setUsers(data.users || []);
      } catch (error) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ==========================================
  // STATISTICS
  // ==========================================

  const studentCount = users.filter(
    (user) => user.role === "student"
  ).length;

  const providerCount = users.filter(
    (user) => user.role === "provider"
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  // ==========================================
  // SEARCH + FILTER
  // ==========================================

  const filteredUsers = users.filter((user) => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    const matchesSearch =
      !search ||
      user.fullName
        ?.toLowerCase()
        .includes(search) ||
      user.email
        ?.toLowerCase()
        .includes(search);

    const matchesRole =
      roleFilter === "all" ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
  };

  const filtersActive =
    searchTerm.trim() !== "" ||
    roleFilter !== "all";

  // ==========================================
  // HELPERS
  // ==========================================

  const getRoleClass = (role) => {
    switch (role) {
      case "student":
        return "admin-user-role-student";

      case "provider":
        return "admin-user-role-provider";

      case "admin":
        return "admin-user-role-admin";

      default:
        return "";
    }
  };

  const getRoleLabel = (role) => {
    if (!role) {
      return "Unknown";
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
  };

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <div className="student-loading-card">
            <div className="student-spinner" />

            <h2>Loading users</h2>

            <p>
              Retrieving registered user
              accounts...
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
              Unable to load users
            </h2>

            <p>{error}</p>

            <Link
              to="/admin"
              className="btn btn-secondary"
            >
              Back to Dashboard
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
    <main className="admin-page">
      <div className="admin-container">

        {/* BREADCRUMB */}

        <div className="admin-users-breadcrumb">
          <Link to="/admin">
            Admin Dashboard
          </Link>

          <span>›</span>

          <span>Manage Users</span>
        </div>

        {/* HEADER */}

        <section className="admin-dashboard-header">
          <div>
            <span className="admin-eyebrow">
              User Administration
            </span>

            <h1>Manage Users</h1>

            <p>
              View and monitor all registered
              users in the Smart Scholarship
              Application and Management System.
            </p>
          </div>

          <div className="admin-header-badge">
            {users.length} Registered Users
          </div>
        </section>

        {/* STATISTICS */}

        <section className="admin-user-stats">
          <div className="admin-user-stat-card">
            <div className="admin-user-stat-icon">
              👥
            </div>

            <div>
              <span>Total Users</span>

              <strong>
                {users.length}
              </strong>

              <p>
                All registered accounts
              </p>
            </div>
          </div>

          <div className="admin-user-stat-card">
            <div className="admin-user-stat-icon">
              🎓
            </div>

            <div>
              <span>Students</span>

              <strong>
                {studentCount}
              </strong>

              <p>
                Scholarship applicants
              </p>
            </div>
          </div>

          <div className="admin-user-stat-card">
            <div className="admin-user-stat-icon">
              🏢
            </div>

            <div>
              <span>Providers</span>

              <strong>
                {providerCount}
              </strong>

              <p>
                Scholarship providers
              </p>
            </div>
          </div>

          <div className="admin-user-stat-card">
            <div className="admin-user-stat-icon">
              ⚙️
            </div>

            <div>
              <span>Administrators</span>

              <strong>
                {adminCount}
              </strong>

              <p>
                System administrators
              </p>
            </div>
          </div>
        </section>

        {/* SEARCH AND FILTER */}

        <section className="admin-user-controls">
          <div className="admin-user-search">
            <span>⌕</span>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search by name or email..."
            />
          </div>

          <select
            className="admin-role-filter"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >
            <option value="all">
              All Roles
            </option>

            <option value="student">
              Students
            </option>

            <option value="provider">
              Providers
            </option>

            <option value="admin">
              Administrators
            </option>
          </select>

          {filtersActive && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </section>

        {/* RESULT INFO */}

        <div className="admin-users-result-heading">
          <div>
            <h2>
              Registered Users
            </h2>

            <p>
              Showing {filteredUsers.length} of{" "}
              {users.length} users
            </p>
          </div>
        </div>

        {/* EMPTY */}

        {users.length === 0 ? (
          <section className="provider-empty-state">
            <div className="provider-empty-icon">
              👥
            </div>

            <h2>No users found</h2>

            <p>
              There are currently no
              registered users in the system.
            </p>
          </section>
        ) : filteredUsers.length === 0 ? (
          <section className="provider-empty-state">
            <div className="provider-empty-icon">
              🔍
            </div>

            <h2>
              No matching users
            </h2>

            <p>
              No users match your current
              search and role filters.
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </section>
        ) : (
          <section className="admin-users-table-card">
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-user-identity">
                          <div className="admin-user-avatar">
                            {getInitials(
                              user.fullName
                            )}
                          </div>

                          <div>
                            <strong>
                              {user.fullName}
                            </strong>

                            <span>
                              ID:{" "}
                              {user._id
                                ?.slice(-6)
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-user-email">
                          {user.email}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-user-role ${getRoleClass(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(
                            user.role
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="admin-user-date">
                          <strong>
                            {new Date(
                              user.createdAt
                            ).toLocaleDateString()}
                          </strong>

                          <span>
                            Account created
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECURITY NOTE */}

        <section className="admin-users-security-note">
          <div>🔒</div>

          <div>
            <strong>
              User account security
            </strong>

            <p>
              This administrative view displays
              account information required for
              system management. User passwords
              are not displayed.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminUsers;