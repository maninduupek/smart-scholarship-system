require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const User = require("./models/User");
const Scholarship = require("./models/Scholarship");
const Application = require("./models/Application");
const StudentProfile = require("./models/StudentProfile");

const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
const upload = require("./middleware/uploadMiddleware");

const app = express();

// ==========================================
// ENVIRONMENT VARIABLES
// ==========================================

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// DATABASE CONNECTION
// ==========================================

mongoose
  .connect(process.env.MONGO_URI)
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

app.post(
  "/api/users/register",
  async (req, res) => {
    try {
      let {
        fullName,
        email,
        password,
      } = req.body;

      if (
        !fullName ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Full name, email and password are required.",
        });
      }

      fullName = fullName.trim();

      email = email
        .trim()
        .toLowerCase();

      if (fullName.length < 2) {
        return res.status(400).json({
          message:
            "Please enter a valid full name.",
        });
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(email)
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid email address.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must contain at least 6 characters.",
        });
      }

      const existingUser =
        await User.findOne({
          email,
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "An account with this email already exists.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user = new User({
        fullName,
        email,
        password: hashedPassword,
        role: "student",
      });

      await user.save();

      return res.status(201).json({
        message:
          "User registered successfully!",

        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      return res.status(500).json({
        message:
          "Registration failed. Please try again.",
      });
    }
  }
);

// ==========================================
// USER LOGIN
// ==========================================

app.post(
  "/api/users/login",
  async (req, res) => {
    try {
      let {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Email and password are required.",
        });
      }

      email = email
        .trim()
        .toLowerCase();

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(email)
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid email address.",
        });
      }

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.status(400).json({
          message:
            "Invalid email or password.",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatch) {
        return res.status(400).json({
          message:
            "Invalid email or password.",
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

      return res.status(200).json({
        message:
          "Login successful!",

        token,

        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return res.status(500).json({
        message:
          "Login failed. Please try again.",
      });
    }
  }
);

// ==========================================
// STUDENT PROFILE - GET
// ==========================================

app.get(
  "/api/student/profile",
  authMiddleware,
  roleMiddleware(["student"]),

  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select(
          "fullName email"
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      const profile =
        await StudentProfile.findOne({
          student: req.user.id,
        });

      return res.status(200).json({
        user,
        profile,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to load student profile.",

        error: error.message,
      });
    }
  }
);

// ==========================================
// STUDENT PROFILE - CREATE / UPDATE
// STEP 30.6B VALIDATION
// ==========================================

app.put(
  "/api/student/profile",
  authMiddleware,
  roleMiddleware(["student"]),

  async (req, res) => {
    try {
      let {
        university,
        course,
        academicYear,
        gpa,
      } = req.body;

      // ======================================
      // REQUIRED FIELDS
      // ======================================

      if (
        university === undefined ||
        course === undefined ||
        academicYear === undefined ||
        gpa === undefined ||
        university === null ||
        course === null ||
        academicYear === null ||
        gpa === null
      ) {
        return res.status(400).json({
          message:
            "University, course, academic year and GPA are required.",
        });
      }

      // ======================================
      // CLEAN TEXT INPUT
      // ======================================

      university =
        String(university).trim();

      course =
        String(course).trim();

      if (!university) {
        return res.status(400).json({
          message:
            "University is required.",
        });
      }

      if (!course) {
        return res.status(400).json({
          message:
            "Course is required.",
        });
      }

      // ======================================
      // CONVERT NUMERIC VALUES
      // ======================================

      if (
        academicYear === "" ||
        gpa === ""
      ) {
        return res.status(400).json({
          message:
            "Academic year and GPA are required.",
        });
      }

      const academicYearNumber =
        Number(academicYear);

      const gpaNumber =
        Number(gpa);

      // ======================================
      // ACADEMIC YEAR VALIDATION
      // ======================================

      if (
        !Number.isInteger(
          academicYearNumber
        ) ||
        academicYearNumber < 1 ||
        academicYearNumber > 6
      ) {
        return res.status(400).json({
          message:
            "Academic year must be a whole number between 1 and 6.",
        });
      }

      // ======================================
      // GPA VALIDATION
      // ======================================

      if (
        !Number.isFinite(
          gpaNumber
        ) ||
        gpaNumber < 0 ||
        gpaNumber > 4
      ) {
        return res.status(400).json({
          message:
            "GPA must be between 0.00 and 4.00.",
        });
      }

      // ======================================
      // SAVE PROFILE
      // ======================================

      const profile =
        await StudentProfile.findOneAndUpdate(
          {
            student: req.user.id,
          },

          {
            student: req.user.id,
            university,
            course,
            academicYear:
              academicYearNumber,
            gpa:
              gpaNumber,
          },

          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        );

      return res.status(200).json({
        message:
          "Student profile saved successfully!",

        profile,
      });
    } catch (error) {
      console.error(
        "Student profile save error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to save student profile.",
      });
    }
  }
);

// ==========================================
// CREATE SCHOLARSHIP
// ==========================================

app.post(
  "/api/scholarships",
  authMiddleware,
  roleMiddleware([
    "provider",
    "admin",
  ]),

  async (req, res) => {
    try {
      const {
        title,
        provider,
        description,
        amount,
        deadline,
        eligibility,
        minimumGPA,
        requiredAcademicYear,
        requiredCourse,
        requirements,
      } = req.body;

      const scholarship =
        new Scholarship({
          title,
          provider,

          providerUser:
            req.user.id,

          description,

          amount:
            Number(amount),

          deadline,

          eligibility,

          minimumGPA:
            minimumGPA === "" ||
            minimumGPA === undefined
              ? 0
              : Number(
                  minimumGPA
                ),

          requiredAcademicYear:
            requiredAcademicYear === "" ||
            requiredAcademicYear ===
              undefined ||
            requiredAcademicYear ===
              null
              ? null
              : Number(
                  requiredAcademicYear
                ),

          requiredCourse:
            requiredCourse || "",

          requirements:
            requirements || [],

          status: "active",
        });

      await scholarship.save();

      return res.status(201).json({
        message:
          "Scholarship created successfully!",

        scholarship,
      });
    } catch (error) {
      return res.status(500).json({
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

      return res.status(200).json({
        scholarships,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to fetch scholarships.",

        error: error.message,
      });
    }
  }
);

// ==========================================
// PROVIDER / ADMIN - OWN SCHOLARSHIPS
// ==========================================

app.get(
  "/api/scholarships/provider/my",
  authMiddleware,
  roleMiddleware([
    "provider",
    "admin",
  ]),

  async (req, res) => {
    try {
      let scholarships;

      if (
        req.user.role === "admin"
      ) {
        scholarships =
          await Scholarship.find().sort({
            createdAt: -1,
          });
      } else {
        scholarships =
          await Scholarship.find({
            providerUser:
              req.user.id,
          }).sort({
            createdAt: -1,
          });
      }

      return res.status(200).json({
        scholarships,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to fetch provider scholarships.",

        error: error.message,
      });
    }
  }
);

// ==========================================
// STUDENT - CHECK ELIGIBILITY
// ==========================================

app.get(
  "/api/scholarships/:id/eligibility",
  authMiddleware,
  roleMiddleware(["student"]),

  async (req, res) => {
    try {
      const scholarship =
        await Scholarship.findById(
          req.params.id
        );

      if (!scholarship) {
        return res.status(404).json({
          message:
            "Scholarship not found.",
        });
      }

      if (
        scholarship.status !==
        "active"
      ) {
        return res.status(400).json({
          message:
            "This scholarship is currently closed.",
        });
      }

      const profile =
        await StudentProfile.findOne({
          student: req.user.id,
        });

      if (!profile) {
        return res.status(400).json({
          message:
            "Please complete your student profile before checking eligibility.",
        });
      }

      const reasons = [];

      // GPA CHECK
      if (
        scholarship.minimumGPA >
          0 &&
        (profile.gpa ===
          undefined ||
          profile.gpa === null ||
          profile.gpa <
            scholarship.minimumGPA)
      ) {
        reasons.push(
          `Minimum GPA required is ${scholarship.minimumGPA}. Your GPA is ${
            profile.gpa ??
            "not provided"
          }.`
        );
      }

      // ACADEMIC YEAR CHECK
      if (
        scholarship.requiredAcademicYear &&
        profile.academicYear !==
          scholarship.requiredAcademicYear
      ) {
        reasons.push(
          `Required academic year is Year ${scholarship.requiredAcademicYear}. Your academic year is Year ${
            profile.academicYear ??
            "not provided"
          }.`
        );
      }

      // COURSE CHECK
      if (
        scholarship.requiredCourse &&
        scholarship.requiredCourse.trim() !==
          ""
      ) {
        const studentCourse = (
          profile.course || ""
        )
          .trim()
          .toLowerCase();

        const requiredCourse =
          scholarship.requiredCourse
            .trim()
            .toLowerCase();

        if (
          studentCourse !==
          requiredCourse
        ) {
          reasons.push(
            `Required course is ${scholarship.requiredCourse}. Your course is ${
              profile.course ||
              "not provided"
            }.`
          );
        }
      }

      const eligible =
        reasons.length === 0;

      return res.status(200).json({
        eligible,

        message: eligible
          ? "You are eligible for this scholarship."
          : "You do not meet all eligibility requirements.",

        reasons,

        studentProfile: {
          university:
            profile.university,
          course:
            profile.course,
          academicYear:
            profile.academicYear,
          gpa:
            profile.gpa,
        },

        scholarshipCriteria: {
          minimumGPA:
            scholarship.minimumGPA ||
            0,
          requiredAcademicYear:
            scholarship.requiredAcademicYear,
          requiredCourse:
            scholarship.requiredCourse ||
            "",
        },
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to check scholarship eligibility.",

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
          message:
            "Scholarship not found.",
        });
      }

      return res.status(200).json({
        scholarship,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to fetch scholarship.",

        error: error.message,
      });
    }
  }
);

// ==========================================
// UPDATE SCHOLARSHIP
// ==========================================

app.put(
  "/api/scholarships/:id",
  authMiddleware,
  roleMiddleware([
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
          message:
            "Scholarship not found.",
        });
      }

      if (
        req.user.role ===
          "provider" &&
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
        minimumGPA,
        requiredAcademicYear,
        requiredCourse,
        requirements,
      } = req.body;

      if (
        title !== undefined
      ) {
        scholarship.title =
          title;
      }

      if (
        provider !== undefined
      ) {
        scholarship.provider =
          provider;
      }

      if (
        description !==
        undefined
      ) {
        scholarship.description =
          description;
      }

      if (
        amount !== undefined
      ) {
        scholarship.amount =
          Number(amount);
      }

      if (
        deadline !== undefined
      ) {
        scholarship.deadline =
          deadline;
      }

      if (
        eligibility !==
        undefined
      ) {
        scholarship.eligibility =
          eligibility;
      }

      if (
        minimumGPA !==
        undefined
      ) {
        scholarship.minimumGPA =
          minimumGPA === ""
            ? 0
            : Number(
                minimumGPA
              );
      }

      if (
        requiredAcademicYear !==
        undefined
      ) {
        scholarship.requiredAcademicYear =
          requiredAcademicYear ===
            "" ||
          requiredAcademicYear ===
            null
            ? null
            : Number(
                requiredAcademicYear
              );
      }

      if (
        requiredCourse !==
        undefined
      ) {
        scholarship.requiredCourse =
          requiredCourse.trim();
      }

      if (
        requirements !==
        undefined
      ) {
        scholarship.requirements =
          requirements;
      }

      await scholarship.save();

      return res.status(200).json({
        message:
          "Scholarship updated successfully!",

        scholarship,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to update scholarship.",

        error: error.message,
      });
    }
  }
);

// ==========================================
// CHANGE SCHOLARSHIP STATUS
// ==========================================

app.patch(
  "/api/scholarships/:id/status",
  authMiddleware,
  roleMiddleware([
    "provider",
    "admin",
  ]),

  async (req, res) => {
    try {
      const { status } =
        req.body;

      if (
        ![
          "active",
          "closed",
        ].includes(status)
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
          message:
            "Scholarship not found.",
        });
      }

      if (
        req.user.role ===
          "provider" &&
        (!scholarship.providerUser ||
          scholarship.providerUser.toString() !==
            req.user.id)
      ) {
        return res.status(403).json({
          message:
            "You can only manage your own scholarships.",
        });
      }

      scholarship.status =
        status;

      await scholarship.save();

      return res.status(200).json({
        message:
          "Scholarship status updated successfully!",

        scholarship,
      });
    } catch (error) {
      return res.status(500).json({
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
  upload.array(
    "documents",
    5
  ),

  async (req, res) => {
    try {
      const {
        scholarshipId,
        statement,
      } = req.body;

      const scholarship =
        await Scholarship.findById(
          scholarshipId
        );

      if (!scholarship) {
        return res.status(404).json({
          message:
            "Scholarship not found.",
        });
      }

      if (
        scholarship.status !==
        "active"
      ) {
        return res.status(400).json({
          message:
            "This scholarship is currently closed.",
        });
      }

      // PREVENT DUPLICATE APPLICATION
      const existingApplication =
        await Application.findOne({
          student:
            req.user.id,
          scholarship:
            scholarshipId,
        });

      if (
        existingApplication
      ) {
        return res.status(400).json({
          message:
            "You have already applied for this scholarship.",
        });
      }

      const user =
        await User.findById(
          req.user.id
        ).select(
          "fullName email"
        );

      if (!user) {
        return res.status(404).json({
          message:
            "Student account not found.",
        });
      }

      const profile =
        await StudentProfile.findOne({
          student:
            req.user.id,
        });

      if (!profile) {
        return res.status(400).json({
          message:
            "Please complete your student profile before applying.",
        });
      }

      // ======================================
      // BACKEND ELIGIBILITY CHECK
      // ======================================

      const eligibilityReasons =
        [];

      if (
        scholarship.minimumGPA >
          0 &&
        (profile.gpa ===
          undefined ||
          profile.gpa === null ||
          profile.gpa <
            scholarship.minimumGPA)
      ) {
        eligibilityReasons.push(
          `Minimum GPA required is ${scholarship.minimumGPA}. Your GPA is ${
            profile.gpa ??
            "not provided"
          }.`
        );
      }

      if (
        scholarship.requiredAcademicYear &&
        profile.academicYear !==
          scholarship.requiredAcademicYear
      ) {
        eligibilityReasons.push(
          `Required academic year is Year ${scholarship.requiredAcademicYear}. Your academic year is Year ${
            profile.academicYear ??
            "not provided"
          }.`
        );
      }

      if (
        scholarship.requiredCourse &&
        scholarship.requiredCourse.trim() !==
          ""
      ) {
        const studentCourse = (
          profile.course || ""
        )
          .trim()
          .toLowerCase();

        const requiredCourse =
          scholarship.requiredCourse
            .trim()
            .toLowerCase();

        if (
          studentCourse !==
          requiredCourse
        ) {
          eligibilityReasons.push(
            `Required course is ${scholarship.requiredCourse}. Your course is ${
              profile.course ||
              "not provided"
            }.`
          );
        }
      }

      if (
        eligibilityReasons.length >
        0
      ) {
        return res.status(403).json({
          message:
            "You are not eligible to apply for this scholarship.",

          reasons:
            eligibilityReasons,
        });
      }

      // STATEMENT VALIDATION
      if (
        !statement ||
        statement.trim() === ""
      ) {
        return res.status(400).json({
          message:
            "Statement of purpose is required.",
        });
      }

      // UPLOADED DOCUMENT METADATA
      const uploadedDocuments = (
        req.files || []
      ).map(
        (file) => ({
          originalName:
            file.originalname,
          fileName:
            file.filename,
          filePath:
            file.path,
          fileType:
            file.mimetype,
          fileSize:
            file.size,
        })
      );

      const application =
        new Application({
          student:
            req.user.id,

          scholarship:
            scholarshipId,

          fullName:
            user.fullName,

          email:
            user.email,

          university:
            profile.university,

          course:
            profile.course,

          academicYear:
            profile.academicYear,

          statement:
            statement.trim(),

          documents:
            uploadedDocuments,

          status:
            "submitted",
        });

      await application.save();

      return res.status(201).json({
        message:
          "Application submitted successfully!",

        application,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to submit application.",

        error:
          error.message,
      });
    }
  }
);

// ==========================================
// SECURE APPLICATION DOCUMENT ACCESS
// ==========================================

app.get(
  "/api/applications/:applicationId/documents/:documentId",
  authMiddleware,
  roleMiddleware([
    "student",
    "provider",
    "admin",
  ]),

  async (req, res) => {
    try {
      const {
        applicationId,
        documentId,
      } = req.params;

      const application =
        await Application.findById(
          applicationId
        ).populate(
          "scholarship"
        );

      if (!application) {
        return res.status(404).json({
          message:
            "Application not found.",
        });
      }

      const document =
        application.documents.id(
          documentId
        );

      if (!document) {
        return res.status(404).json({
          message:
            "Document not found.",
        });
      }

      // STUDENT ACCESS
      if (
        req.user.role ===
        "student" &&
        application.student.toString() !==
          req.user.id
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to view this document.",
        });
      }

      // PROVIDER ACCESS
      if (
        req.user.role ===
        "provider"
      ) {
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
              "You are not allowed to view this document.",
          });
        }
      }

      const uploadsDirectory =
        path.resolve(
          __dirname,
          "uploads"
        );

      const safeFileName =
        path.basename(
          document.fileName
        );

      const filePath =
        path.resolve(
          uploadsDirectory,
          safeFileName
        );

      if (
        path.dirname(
          filePath
        ) !==
        uploadsDirectory
      ) {
        return res.status(400).json({
          message:
            "Invalid document path.",
        });
      }

      res.setHeader(
        "Content-Type",
        document.fileType ||
          "application/octet-stream"
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(
          document.originalName
        )}"`
      );

      return res.sendFile(
        filePath,

        (error) => {
          if (
            error &&
            !res.headersSent
          ) {
            return res.status(404).json({
              message:
                "Document file was not found on the server.",
            });
          }
        }
      );
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to open document.",

        error:
          error.message,
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
          student:
            req.user.id,
        })
          .populate(
            "scholarship"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        applications,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to fetch your applications.",

        error:
          error.message,
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
  roleMiddleware([
    "provider",
    "admin",
  ]),

  async (req, res) => {
    try {
      let applications;

      if (
        req.user.role ===
        "admin"
      ) {
        applications =
          await Application.find()
            .populate(
              "student",
              "fullName email"
            )
            .populate(
              "scholarship"
            )
            .sort({
              createdAt: -1,
            });
      } else {
        const providerScholarships =
          await Scholarship.find({
            providerUser:
              req.user.id,
          }).select("_id");

        const scholarshipIds =
          providerScholarships.map(
            (scholarship) =>
              scholarship._id
          );

        applications =
          await Application.find({
            scholarship: {
              $in:
                scholarshipIds,
            },
          })
            .populate(
              "student",
              "fullName email"
            )
            .populate(
              "scholarship"
            )
            .sort({
              createdAt: -1,
            });
      }

      return res.status(200).json({
        applications,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to fetch applications.",

        error:
          error.message,
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
  roleMiddleware([
    "provider",
    "admin",
  ]),

  async (req, res) => {
    try {
      const { status } =
        req.body;

      const allowedStatuses = [
        "submitted",
        "under review",
        "selected",
        "rejected",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid application status.",
        });
      }

      const application =
        await Application.findById(
          req.params.id
        ).populate(
          "scholarship"
        );

      if (!application) {
        return res.status(404).json({
          message:
            "Application not found.",
        });
      }

      if (
        req.user.role ===
        "provider"
      ) {
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

      application.status =
        status;

      await application.save();

      return res.status(200).json({
        message:
          "Application status updated successfully!",

        application,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to update application status.",

        error:
          error.message,
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
      ] =
        await Promise.all([
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

      return res.status(200).json({
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
      return res.status(500).json({
        message:
          "Failed to load admin dashboard.",

        error:
          error.message,
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
      const users =
        await User.find()
          .select("-password")
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        users,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to fetch users.",

        error:
          error.message,
      });
    }
  }
);

// ==========================================
// FILE UPLOAD ERROR HANDLER
// ==========================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          message:
            "Each document must be 5 MB or smaller.",
        });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res.status(400).json({
          message:
            "You can upload a maximum of 5 documents.",
        });
      }

      return res.status(400).json({
        message:
          `File upload error: ${error.message}`,
      });
    }

    if (
      error.message ===
      "Only PDF, JPG, JPEG, PNG, DOC and DOCX files are allowed."
    ) {
      return res.status(400).json({
        message:
          error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message:
        "An unexpected server error occurred.",
    });
  }
);

// ==========================================
// START SERVER
// ==========================================

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);