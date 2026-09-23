const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/User");
const Scholarship = require("./models/Scholarship");

const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const app = express();

const PORT = 5000;

// JWT secret
const JWT_SECRET = "smart-scholarship-secret-key";

// Allow frontend to communicate with backend
app.use(cors());

// Allow Express to read JSON data
app.use(express.json());

// Connect to local MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/smartScholarshipDB")
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send("Smart Scholarship Backend is running!");
});

// ==========================================
// PROTECTED TEST ROUTE
// ==========================================

app.get("/api/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You accessed a protected route successfully!",
    user: req.user,
  });
});

// ==========================================
// STUDENT-ONLY TEST ROUTE
// ==========================================

app.get(
  "/api/student-test",
  authMiddleware,
  roleMiddleware(["student"]),
  (req, res) => {
    res.status(200).json({
      message: "Student access granted!",
      user: req.user,
    });
  }
);

// ==========================================
// TEMPORARY TEST SCHOLARSHIP ROUTE
// ==========================================

app.post(
  "/api/scholarships/test",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const scholarship = new Scholarship({
        title: "Test Technology Scholarship",
        provider: "Tech Foundation",
        description:
          "A test scholarship for technology students.",
        amount: 100000,
        deadline: new Date("2026-12-31"),
        eligibility:
          "Open to university students studying technology.",
        requirements: [
          "Student ID",
          "Academic transcript",
          "Recommendation letter",
        ],
        status: "active",
      });

      await scholarship.save();

      res.status(201).json({
        message: "Test scholarship created successfully!",
        scholarship,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create scholarship.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// REGISTER USER
// ==========================================

app.post("/api/users/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// ==========================================
// LOGIN USER
// ==========================================

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Login successful
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});