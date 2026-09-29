const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/User");
const Scholarship = require("./models/Scholarship");
const Application = require("./models/Application");

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

// ==========================================
// CONNECT TO LOCAL MONGODB
// ==========================================

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
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
// CREATE SCHOLARSHIP
// Provider/Admin only
// ==========================================

app.post(
  "/api/scholarships",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
  async (req, res) => {
    try {
      const {
        title,
        provider,
        description,
        amount,
        deadline,
        eligibility,
        requirements,
      } = req.body;

      const scholarship = new Scholarship({
        title,
        provider,
        description,
        amount,
        deadline,
        eligibility,
        requirements,
        status: "active",
      });

      await scholarship.save();

      res.status(201).json({
        message: "Scholarship created successfully!",
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
// GET ALL SCHOLARSHIPS
// Authenticated users can view scholarships
// ==========================================

app.get(
  "/api/scholarships",
  authMiddleware,
  async (req, res) => {
    try {
      const scholarships = await Scholarship.find({
        status: "active",
      }).sort({ createdAt: -1 });

      res.status(200).json({
        scholarships,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch scholarships.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// GET SINGLE SCHOLARSHIP
// Authenticated users can view scholarship details
// ==========================================

app.get(
  "/api/scholarships/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const scholarship = await Scholarship.findById(
        req.params.id
      );

      if (!scholarship) {
        return res.status(404).json({
          message: "Scholarship not found.",
        });
      }

      res.status(200).json({
        scholarship,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch scholarship.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// SUBMIT SCHOLARSHIP APPLICATION
// Student only
// ==========================================

app.post(
  "/api/applications",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const {
        scholarshipId,
        fullName,
        email,
        university,
        course,
        academicYear,
        statement,
      } = req.body;

      // Check if scholarship exists
      const scholarship = await Scholarship.findById(
        scholarshipId
      );

      if (!scholarship) {
        return res.status(404).json({
          message: "Scholarship not found.",
        });
      }

      // Check if student already applied
      const existingApplication = await Application.findOne({
        student: req.user.id,
        scholarship: scholarshipId,
      });

      if (existingApplication) {
        return res.status(400).json({
          message:
            "You have already applied for this scholarship.",
        });
      }

      // Create application
      const application = new Application({
        student: req.user.id,
        scholarship: scholarshipId,
        fullName,
        email,
        university,
        course,
        academicYear,
        statement,
        status: "submitted",
      });

      await application.save();

      res.status(201).json({
        message: "Application submitted successfully!",
        application,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to submit application.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});