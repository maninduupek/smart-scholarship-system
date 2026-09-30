import { useState } from "react";

function CreateScholarship() {
  const [formData, setFormData] = useState({
    title: "",
    provider: "",
    description: "",
    amount: "",
    deadline: "",
    eligibility: "",
    requirements: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login as a provider.");
      return;
    }

    try {
      const requirementsArray = formData.requirements
        .split(",")
        .map((requirement) => requirement.trim())
        .filter((requirement) => requirement !== "");

      const response = await fetch(
        "http://localhost:5000/api/scholarships",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: formData.title,
            provider: formData.provider,
            description: formData.description,
            amount: Number(formData.amount),
            deadline: formData.deadline,
            eligibility: formData.eligibility,
            requirements: requirementsArray,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to create scholarship."
        );
        return;
      }

      setMessage("Scholarship created successfully!");

      setFormData({
        title: "",
        provider: "",
        description: "",
        amount: "",
        deadline: "",
        eligibility: "",
        requirements: "",
      });
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  };

  return (
    <main>
      <section>
        <h1>Create Scholarship</h1>

        <p>
          Create a new scholarship opportunity for students.
        </p>

        {message && <p>{message}</p>}

        {error && <p>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Scholarship Title</label>
            <br />

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label>Provider / Organization Name</label>
            <br />

            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label>Description</label>
            <br />

            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <br />

          <div>
            <label>Scholarship Amount (Rs.)</label>
            <br />

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <br />

          <div>
            <label>Application Deadline</label>
            <br />

            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label>Eligibility</label>
            <br />

            <textarea
              name="eligibility"
              rows="4"
              value={formData.eligibility}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <br />

          <div>
            <label>Requirements</label>

            <p>
              Enter requirements separated by commas.
            </p>

            <textarea
              name="requirements"
              rows="4"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="University student, GPA above 3.0, Academic transcript"
            ></textarea>
          </div>

          <br />

          <button type="submit">
            Create Scholarship
          </button>
        </form>
      </section>
    </main>
  );
}

export default CreateScholarship;