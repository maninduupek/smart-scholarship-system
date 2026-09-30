import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <h2>Smart Scholarship System</h2>

      <div>
        <Link to="/">Home</Link>

        <Link to="/scholarships">
          Scholarships
        </Link>

        <Link to="/my-applications">
          My Applications
        </Link>

        <Link to="/provider-applications">
          Provider Applications
        </Link>

        <Link to="/about">About</Link>

        <Link to="/login">Login</Link>

        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;