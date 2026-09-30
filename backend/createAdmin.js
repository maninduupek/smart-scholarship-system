const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/smartScholarshipDB"
    );

    console.log("MongoDB connected!");

    const existingAdmin = await User.findOne({
      email: "admin@test.com",
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(
      "Admin123",
      10
    );

    const admin = new User({
      fullName: "System Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    console.log("Admin account created successfully!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Failed to create admin:", error);

    await mongoose.connection.close();
  }
};

createAdmin();