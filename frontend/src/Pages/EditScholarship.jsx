import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditScholarship() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    provider: "",
    description: "",
    amount: "",
    deadline: "",
    eligibility: "",
    requirements: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScholarship = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as a provider.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/scholarships/${id}`,
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
            data.message || "Failed to load scholarship."
          );
          setLoading(false);
          return;
        }

        const scholarship = data.scholarship;

        setFormData({
          title: scholarship.title,
          provider: scholarship.provider,
          description: scholarship.description,
          amount: scholarship.amount,
          deadline: scholarship.deadline
            ? scholarship.deadline.split("T")[0]
            : "",
          eligibility: scholarship.eligibility,
          requirements:
            scholarship.requirements?.join(", ") || "",
        });
      } catch (error) {
        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id]);

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

    const requirementsArray = formData.requirements
      .split(",")
      .map((requirement) => requirement.trim())
      .filter((requirement) => requirement !== "");

    try {
      const response = await fetch(
        `http://localhost:5000/api/scholarships/${id}`,
        {
          method: "PUT",

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
          data.message || "Failed to update scholarship."
        );
        return;
      }

      setMessage("Scholarship updated successfully!");

      setTimeout(() => {
        navigate("/my-scholarships");
      }, 1000);
    } catch (error) {
      setError(
        "Unable to connect to the server."
      );
    }
  };

  if (loading) {
    return (
      <main>
        <h1>Edit Scholarship</h1>
        <p>Loading scholarship...</p>
      </main>
    );
  }

  if (error && !formData.title) {
    return (
      <main>
        <h1>Edit Scholarship</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Edit Scholarship</h1>

        <p>
          Update the scholarship information below.
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
            ></textarea>
          </div>

          <br />

          <button type="submit">
            Save Changes
          </button>

          {" "}

          <button
            type="button"
            onClick={() => navigate("/my-scholarships")}
          >
            Cancel
          </button>
        </form>
      </section>
    </main>
  );
}

export default EditScholarship;