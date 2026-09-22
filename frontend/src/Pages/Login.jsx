import { useState } from "react";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      // Save JWT token in browser
      localStorage.setItem("token", data.token);

      // Save logged-in user information
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage(`Welcome, ${data.user.fullName}!`);

      setFormData({
        email: "",
        password: "",
      });

      console.log("Login successful");
      console.log("Token:", data.token);
      console.log("User:", data.user);
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  };

  // Test protected backend route
  const testProtectedRoute = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No login token found.");
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/protected",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Access denied.");
        return;
      }

      setMessage(data.message);

      console.log("Protected route response:", data);
    } catch (error) {
      setError("Unable to connect to the backend.");
    }
  };

  return (
    <div>
      <h1>Login</h1>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      <br />

      <button type="button" onClick={testProtectedRoute}>
        Test Protected Route
      </button>
    </div>
  );
}

export default Login;