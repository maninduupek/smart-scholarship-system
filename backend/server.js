const express = require("express");
const mongoose = require("mongoose");

const app = express();

const PORT = 5000;

// MongoDB connection
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});