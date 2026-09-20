function Scholarships() {
  const scholarships = [
    {
      id: 1,
      title: "University Excellence Scholarship",
      provider: "ABC Foundation",
      description: "Scholarship for high-performing university students.",
    },
    {
      id: 2,
      title: "Future Leaders Scholarship",
      provider: "XYZ Organization",
      description: "Support for students with leadership potential.",
    },
    {
      id: 3,
      title: "Technology Scholarship",
      provider: "Tech Foundation",
      description: "Financial support for students studying technology.",
    },
  ];

  return (
    <main>
      <section>
        <h1>Available Scholarships</h1>

        <p>
          Explore scholarships and find opportunities that match your goals.
        </p>

        <div>
          {scholarships.map((scholarship) => (
            <div key={scholarship.id}>
              <h2>{scholarship.title}</h2>
              <h3>{scholarship.provider}</h3>
              <p>{scholarship.description}</p>
              <button>View Details</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Scholarships;