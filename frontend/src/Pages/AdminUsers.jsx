import { useEffect, useState } from "react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError(data.message || "Failed to load users.");
          return;
        }

        setUsers(data.users);
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

  if (loading) {
    return (
      <main>
        <h1>Manage Users</h1>
        <p>Loading users...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Manage Users</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Manage Users</h1>

        <p>
          View all registered users in the Smart Scholarship System.
        </p>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div>
            {users.map((user) => (
              <div key={user._id}>
                <h2>{user.fullName}</h2>

                <p>
                  <strong>Email:</strong> {user.email}
                </p>

                <p>
                  <strong>Role:</strong> {user.role}
                </p>

                <p>
                  <strong>Registered:</strong>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>

                <hr />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminUsers;