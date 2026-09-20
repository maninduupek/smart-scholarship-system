import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      <section>
        <h1>Find Scholarships for Your Future</h1>

        <p>
          Discover scholarships, check your eligibility,
          and manage your applications in one place.
        </p>

        <Link to="/scholarships">
          <button>Browse Scholarships</button>
        </Link>
      </section>
    </main>
  );
}

export default Home;