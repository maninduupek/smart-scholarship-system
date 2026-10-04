import { Link, useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <div className="not-found-container">

        <div className="not-found-code">
          404
        </div>

        <div className="not-found-icon">
          🔍
        </div>

        <span className="not-found-label">
          Page Not Found
        </span>

        <h1>
          We couldn't find that page
        </h1>

        <p>
          The page you are looking for may have been
          moved, deleted, or the address may be incorrect.
        </p>

        <div className="not-found-actions">
          <Link
            to="/"
            className="not-found-home-button"
          >
            Go to Home
          </Link>

          <button
            type="button"
            className="not-found-back-button"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>

        <div className="not-found-help">
          <span>Smart Scholarship</span>

          <p>
            Application & Management System
          </p>
        </div>
      </div>
    </main>
  );
}

export default NotFound;