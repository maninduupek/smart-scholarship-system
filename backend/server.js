const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const User = require("./models/User");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

// Allow Express to read JSON data


// Connect to local MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/smartScholarshipDB")
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// Test route
app.get("/", (req, res) => {
  res.send("Smart Scholarship Backend is running!");
});

// Register user
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
      role,
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});