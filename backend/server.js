const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/User");
const Scholarship = require("./models/Scholarship");
const Application = require("./models/Application");
const StudentProfile = require("./models/StudentProfile");

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
// DATABASE CONNECTION
// ==========================================

mongoose
  .connect(
    "mongodb://127.0.0.1:27017/smartScholarshipDB"
  )
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error
    );
  });

// ==========================================
// HOME TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send(
    "Smart Scholarship System Backend is running!"
  );
});

// ==========================================
// USER REGISTRATION
// ==========================================

app.post("/api/users/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = new User({
      fullName,
      email,
      password: hashedPassword,

      // Public registration always creates students
      role: "student",
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
// USER LOGIN
// ==========================================

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
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
// STUDENT PROFILE - GET
// ==========================================

app.get(
  "/api/student/profile",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user.id
      ).select("fullName email");

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const profile =
        await StudentProfile.findOne({
          student: req.user.id,
        });

      res.status(200).json({
        user,
        profile,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to load student profile.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// STUDENT PROFILE - CREATE / UPDATE
// ==========================================

app.put(
  "/api/student/profile",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const {
        university,
        course,
        academicYear,
        gpa,
      } = req.body;

      const profile =
        await StudentProfile.findOneAndUpdate(
          {
            student: req.user.id,
          },
          {
            student: req.user.id,
            university,
            course,
            academicYear,
            gpa,
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        );

      res.status(200).json({
        message:
          "Student profile saved successfully!",
        profile,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to save student profile.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// CREATE SCHOLARSHIP
// Provider / Admin
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

        // NEW ELIGIBILITY VALUES
        minimumGPA,
        requiredAcademicYear,
        requiredCourse,

        requirements,
      } = req.body;

      const scholarship = new Scholarship({
        title,
        provider,

        providerUser: req.user.id,

        description,

        amount: Number(amount),

        deadline,

        eligibility,

        // ==================================
        // STRUCTURED ELIGIBILITY
        // ==================================

        minimumGPA:
          minimumGPA === "" ||
          minimumGPA === undefined
            ? 0
            : Number(minimumGPA),

        requiredAcademicYear:
          requiredAcademicYear === "" ||
          requiredAcademicYear === undefined ||
          requiredAcademicYear === null
            ? null
            : Number(requiredAcademicYear),

        requiredCourse:
          requiredCourse || "",

        requirements:
          requirements || [],

        status: "active",
      });

      await scholarship.save();

      res.status(201).json({
        message:
          "Scholarship created successfully!",
        scholarship,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to create scholarship.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// GET ACTIVE SCHOLARSHIPS
// ==========================================

app.get(
  "/api/scholarships",
  authMiddleware,
  roleMiddleware([
    "student",
    "provider",
    "admin",
  ]),
  async (req, res) => {
    try {
      const scholarships =
        await Scholarship.find({
          status: "active",
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        scholarships,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch scholarships.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// GET PROVIDER'S SCHOLARSHIPS
// IMPORTANT: Keep this before /:id
// ==========================================

app.get(
  "/api/scholarships/provider/my",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
  async (req, res) => {
    try {
      let scholarships;

      if (req.user.role === "admin") {
        scholarships =
          await Scholarship.find().sort({
            createdAt: -1,
          });
      } else {
        scholarships =
          await Scholarship.find({
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
        message:
          "Failed to fetch provider scholarships.",
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
  roleMiddleware([
    "student",
    "provider",
    "admin",
  ]),
  async (req, res) => {
    try {
      const scholarship =
        await Scholarship.findById(
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
        message:
          "Failed to fetch scholarship.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// UPDATE SCHOLARSHIP
// Provider / Admin
// ==========================================

app.put(
  "/api/scholarships/:id",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
  async (req, res) => {
    try {
      const scholarship =
        await Scholarship.findById(
          req.params.id
        );

      if (!scholarship) {
        return res.status(404).json({
          message: "Scholarship not found.",
        });
      }

      // Provider can edit only own scholarship
      if (
        req.user.role === "provider" &&
        (!scholarship.providerUser ||
          scholarship.providerUser.toString() !==
            req.user.id)
      ) {
        return res.status(403).json({
          message:
            "You can only edit your own scholarships.",
        });
      }

      const {
        title,
        provider,
        description,
        amount,
        deadline,
        eligibility,

        // NEW ELIGIBILITY VALUES
        minimumGPA,
        requiredAcademicYear,
        requiredCourse,

        requirements,
      } = req.body;

      scholarship.title = title;
      scholarship.provider = provider;
      scholarship.description = description;
      scholarship.amount = Number(amount);
      scholarship.deadline = deadline;
      scholarship.eligibility = eligibility;

      // ==================================
      // UPDATE STRUCTURED ELIGIBILITY
      // ==================================

      scholarship.minimumGPA =
        minimumGPA === "" ||
        minimumGPA === undefined
          ? 0
          : Number(minimumGPA);

      scholarship.requiredAcademicYear =
        requiredAcademicYear === "" ||
        requiredAcademicYear === undefined ||
        requiredAcademicYear === null
          ? null
          : Number(requiredAcademicYear);

      scholarship.requiredCourse =
        requiredCourse || "";

      scholarship.requirements =
        requirements || [];

      await scholarship.save();

      res.status(200).json({
        message:
          "Scholarship updated successfully!",
        scholarship,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to update scholarship.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// CHANGE SCHOLARSHIP STATUS
// Close / Reopen
// ==========================================

app.patch(
  "/api/scholarships/:id/status",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (
        !["active", "closed"].includes(status)
      ) {
        return res.status(400).json({
          message:
            "Status must be active or closed.",
        });
      }

      const scholarship =
        await Scholarship.findById(
          req.params.id
        );

      if (!scholarship) {
        return res.status(404).json({
          message: "Scholarship not found.",
        });
      }

      if (
        req.user.role === "provider" &&
        (!scholarship.providerUser ||
          scholarship.providerUser.toString() !==
            req.user.id)
      ) {
        return res.status(403).json({
          message:
            "You can only manage your own scholarships.",
        });
      }

      scholarship.status = status;

      await scholarship.save();

      res.status(200).json({
        message:
          "Scholarship status updated successfully!",
        scholarship,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to update scholarship status.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// STUDENT - SUBMIT APPLICATION
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

      const scholarship =
        await Scholarship.findById(
          scholarshipId
        );

      if (!scholarship) {
        return res.status(404).json({
          message: "Scholarship not found.",
        });
      }

      if (scholarship.status !== "active") {
        return res.status(400).json({
          message:
            "This scholarship is currently closed.",
        });
      }

      const existingApplication =
        await Application.findOne({
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
        academicYear: Number(academicYear),
        statement,
        status: "submitted",
      });

      await application.save();

      res.status(201).json({
        message:
          "Application submitted successfully!",
        application,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to submit application.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// STUDENT - MY APPLICATIONS
// ==========================================

app.get(
  "/api/applications/my",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const applications =
        await Application.find({
          student: req.user.id,
        })
          .populate("scholarship")
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        applications,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch your applications.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// PROVIDER / ADMIN - VIEW APPLICATIONS
// ==========================================

app.get(
  "/api/applications/provider",
  authMiddleware,
  roleMiddleware(["provider", "admin"]),
  async (req, res) => {
    try {
      let applications;

      // Admin can see every application
      if (req.user.role === "admin") {
        applications =
          await Application.find()
            .populate("student", "fullName email")
            .populate("scholarship")
            .sort({
              createdAt: -1,
            });
      } else {
        // Find scholarships owned by provider
        const providerScholarships =
          await Scholarship.find({
            providerUser: req.user.id,
          }).select("_id");

        const scholarshipIds =
          providerScholarships.map(
            (scholarship) => scholarship._id
          );

        applications =
          await Application.find({
            scholarship: {
              $in: scholarshipIds,
            },
          })
            .populate(
              "student",
              "fullName email"
            )
            .populate("scholarship")
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
          "Failed to fetch applications.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// PROVIDER / ADMIN - UPDATE APPLICATION STATUS
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
          message:
            "Invalid application status.",
        });
      }

      const application =
        await Application.findById(
          req.params.id
        ).populate("scholarship");

      if (!application) {
        return res.status(404).json({
          message: "Application not found.",
        });
      }

      // Provider can only manage applications
      // belonging to their own scholarships
      if (req.user.role === "provider") {
        const scholarship =
          application.scholarship;

        if (
          !scholarship ||
          !scholarship.providerUser ||
          scholarship.providerUser.toString() !==
            req.user.id
        ) {
          return res.status(403).json({
            message:
              "You can only manage applications for your own scholarships.",
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
// ADMIN DASHBOARD
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

        User.countDocuments({
          role: "student",
        }),

        User.countDocuments({
          role: "provider",
        }),

        Scholarship.countDocuments(),

        Scholarship.countDocuments({
          status: "active",
        }),

        Scholarship.countDocuments({
          status: "closed",
        }),

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
        message:
          "Failed to load admin dashboard.",
        error: error.message,
      });
    }
  }
);

// ==========================================
// ADMIN - VIEW USERS
// ==========================================

app.get(
  "/api/admin/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        });

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
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});