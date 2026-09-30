import { useEffect, useState } from "react";

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
            data.message || "Failed to load admin dashboard."
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

  if (loading) {
    return (
      <main>
        <h1>Admin Dashboard</h1>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Admin Dashboard</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Admin Dashboard</h1>

        <p>
          Overview of the Smart Scholarship Application
          and Management System.
        </p>

        <div>
          <h2>Total Users</h2>
          <p>{statistics.totalUsers}</p>
        </div>

        <div>
          <h2>Total Students</h2>
          <p>{statistics.totalStudents}</p>
        </div>

        <div>
          <h2>Total Providers</h2>
          <p>{statistics.totalProviders}</p>
        </div>

        <div>
          <h2>Total Scholarships</h2>
          <p>{statistics.totalScholarships}</p>
        </div>

        <div>
          <h2>Active Scholarships</h2>
          <p>{statistics.activeScholarships}</p>
        </div>

        <div>
          <h2>Closed Scholarships</h2>
          <p>{statistics.closedScholarships}</p>
        </div>

        <div>
          <h2>Total Applications</h2>
          <p>{statistics.totalApplications}</p>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;