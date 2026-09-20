import { useParams } from "react-router-dom";

function ScholarshipDetails() {
  const { id } = useParams();

  const scholarships = {
    1: {
      title: "University Excellence Scholarship",
      provider: "ABC Foundation",
      description:
        "Scholarship for high-performing university students.",
      eligibility: "Open to high-performing university students.",
    },
    2: {
      title: "Future Leaders Scholarship",
      provider: "XYZ Organization",
      description:
        "Support for students with leadership potential.",
      eligibility: "Open to students with leadership potential.",
    },
    3: {
      title: "Technology Scholarship",
      provider: "Tech Foundation",
      description:
        "Financial support for students studying technology.",
      eligibility: "Open to students studying technology.",
    },
  };

  const scholarship = scholarships[id];

  return (
    <main>
      <section>
        {scholarship ? (
          <>
            <h1>{scholarship.title}</h1>

            <h3>{scholarship.provider}</h3>

            <p>{scholarship.description}</p>

            <h2>Eligibility</h2>
            <p>{scholarship.eligibility}</p>

            <button>Apply Now</button>
          </>
        ) : (
          <h1>Scholarship Not Found</h1>
        )}
      </section>
    </main>
  );
}

export default ScholarshipDetails;