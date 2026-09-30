import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Failed to read user information.");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

    window.location.reload();
  };

  return (
    <nav>
      <h2>Smart Scholarship System</h2>

      <div>
        <Link to="/">Home</Link>

        {/* STUDENT */}

        {token && user?.role === "student" && (
          <>
            <Link to="/scholarships">
              Scholarships
            </Link>

            <Link to="/my-applications">
              My Applications
            </Link>
          </>
        )}

        {/* PROVIDER */}

        {token && user?.role === "provider" && (
          <>
            <Link to="/scholarships">
              Scholarships
            </Link>

            <Link to="/my-scholarships">
              My Scholarships
            </Link>

            <Link to="/create-scholarship">
              Create Scholarship
            </Link>

            <Link to="/provider-applications">
              Provider Applications
            </Link>
          </>
        )}

        {/* ADMIN */}

        {token && user?.role === "admin" && (
          <>
            <Link to="/admin">
              Dashboard
            </Link>

            <Link to="/admin/users">
              Manage Users
            </Link>

            <Link to="/scholarships">
              Scholarships
            </Link>

            <Link to="/my-scholarships">
              Manage Scholarships
            </Link>

            <Link to="/provider-applications">
              Manage Applications
            </Link>
          </>
        )}

        <Link to="/about">About</Link>

        {/* NOT LOGGED IN */}

        {!token && (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </>
        )}

        {/* LOGGED IN */}

        {token && (
          <>
            <span>{user?.fullName}</span>

            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;