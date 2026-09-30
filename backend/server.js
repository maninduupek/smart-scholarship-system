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
const JWT_SECRET = "smart-scholarship-secret-key";

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

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
// ADMIN DASHBOARD STATISTICS
// Admin only
// ==========================================

app.get(
  "/api/admin/dashboard",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const [
        totalUsers,
        totalStudents,
        totalProviders,
        totalScholarships,
        activeScholarships,
        closedScholarships,
        totalApplications,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "provider" }),
        Scholarship.countDocuments(),
        Scholarship.countDocuments({ status: "active" }),
        Scholarship.countDocuments({ status: "closed" }),
        Application.countDocuments(),
      ]);

      res.status(200).json({
        statistics: {
          totalUsers,
          totalStudents,
          totalProviders,
          totalScholarships,
          activeScholarships,
          closedScholarships,
          totalApplications,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to load admin dashboard.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// GET ALL USERS
// Admin only
// ==========================================

app.get(
  "/api/admin/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.status(200).json({
        users,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch users.",
        error: error.message,
      });
    }
  }
);

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
        providerUser: req.user.id,
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
// GET ALL ACTIVE SCHOLARSHIPS
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
// GET PROVIDER'S SCHOLARSHIPS
// Provider/Admin
//
// IMPORTANT:
// This must remain before /api/scholarships/:id
// ==========================================

app.get(
  "/api/scholarships/provider/my",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
  async (req, res) => {
    try {
      let scholarships;

      if (req.user.role === "admin") {
        scholarships = await Scholarship.find().sort({
          createdAt: -1,
        });
      } else {
        scholarships = await Scholarship.find({
          providerUser: req.user.id,
        }).sort({
          createdAt: -1,
        });
      }

      res.status(200).json({
        scholarships,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch provider scholarships.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// GET SINGLE SCHOLARSHIP
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
// EDIT SCHOLARSHIP
// Provider owns scholarship OR Admin
// ==========================================

app.put(
  "/api/scholarships/:id",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
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

      if (req.user.role === "provider") {
        if (!scholarship.providerUser) {
          return res.status(403).json({
            message:
              "This scholarship has no provider ownership information.",
          });
        }

        if (
          scholarship.providerUser.toString() !==
          req.user.id.toString()
        ) {
          return res.status(403).json({
            message:
              "You do not have permission to edit this scholarship.",
          });
        }
      }

      const {
        title,
        provider,
        description,
        amount,
        deadline,
        eligibility,
        requirements,
      } = req.body;

      if (title !== undefined) {
        scholarship.title = title;
      }

      if (provider !== undefined) {
        scholarship.provider = provider;
      }

      if (description !== undefined) {
        scholarship.description = description;
      }

      if (amount !== undefined) {
        scholarship.amount = amount;
      }

      if (deadline !== undefined) {
        scholarship.deadline = deadline;
      }

      if (eligibility !== undefined) {
        scholarship.eligibility = eligibility;
      }

      if (requirements !== undefined) {
        scholarship.requirements = requirements;
      }

      await scholarship.save();

      res.status(200).json({
        message: "Scholarship updated successfully!",
        scholarship,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update scholarship.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// CHANGE SCHOLARSHIP STATUS
// Provider owns scholarship OR Admin
// ==========================================

app.patch(
  "/api/scholarships/:id/status",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = ["active", "closed"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid scholarship status.",
        });
      }

      const scholarship = await Scholarship.findById(
        req.params.id
      );

      if (!scholarship) {
        return res.status(404).json({
          message: "Scholarship not found.",
        });
      }

      if (req.user.role === "provider") {
        if (!scholarship.providerUser) {
          return res.status(403).json({
            message:
              "This scholarship has no provider ownership information.",
          });
        }

        if (
          scholarship.providerUser.toString() !==
          req.user.id.toString()
        ) {
          return res.status(403).json({
            message:
              "You do not have permission to manage this scholarship.",
          });
        }
      }

      scholarship.status = status;

      await scholarship.save();

      res.status(200).json({
        message: `Scholarship ${
          status === "active" ? "reopened" : "closed"
        } successfully!`,
        scholarship,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to change scholarship status.",
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

      const scholarship = await Scholarship.findById(
        scholarshipId
      );

      if (!scholarship) {
        return res.status(404).json({
          message: "Scholarship not found.",
        });
      }

      if (scholarship.status !== "active") {
        return res.status(400).json({
          message: "This scholarship is not currently active.",
        });
      }

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
// GET MY APPLICATIONS
// Student only
// ==========================================

app.get(
  "/api/applications/my",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const applications = await Application.find({
        student: req.user.id,
      })
        .populate(
          "scholarship",
          "title provider amount deadline"
        )
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        applications,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch applications.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// GET PROVIDER / ADMIN APPLICATIONS
// ==========================================

app.get(
  "/api/applications/provider",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
  async (req, res) => {
    try {
      let applications;

      if (req.user.role === "admin") {
        applications = await Application.find()
          .populate(
            "student",
            "fullName email"
          )
          .populate(
            "scholarship",
            "title provider amount deadline providerUser"
          )
          .sort({
            createdAt: -1,
          });
      } else {
        const providerScholarships =
          await Scholarship.find({
            providerUser: req.user.id,
          }).select("_id");

        const scholarshipIds =
          providerScholarships.map(
            (scholarship) => scholarship._id
          );

        applications = await Application.find({
          scholarship: {
            $in: scholarshipIds,
          },
        })
          .populate(
            "student",
            "fullName email"
          )
          .populate(
            "scholarship",
            "title provider amount deadline providerUser"
          )
          .sort({
            createdAt: -1,
          });
      }

      res.status(200).json({
        applications,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch provider applications.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// UPDATE APPLICATION STATUS
// Provider owns scholarship OR Admin
// ==========================================

app.patch(
  "/api/applications/:id/status",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "submitted",
        "under review",
        "selected",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid application status.",
        });
      }

      const application = await Application.findById(
        req.params.id
      ).populate("scholarship");

      if (!application) {
        return res.status(404).json({
          message: "Application not found.",
        });
      }

      if (!application.scholarship) {
        return res.status(404).json({
          message: "Scholarship not found.",
        });
      }

      if (req.user.role === "provider") {
        const providerUser =
          application.scholarship.providerUser;

        if (!providerUser) {
          return res.status(403).json({
            message:
              "This scholarship has no provider ownership information.",
          });
        }

        if (
          providerUser.toString() !==
          req.user.id.toString()
        ) {
          return res.status(403).json({
            message:
              "You do not have permission to manage this application.",
          });
        }
      }

      application.status = status;

      await application.save();

      res.status(200).json({
        message:
          "Application status updated successfully!",
        application,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to update application status.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});