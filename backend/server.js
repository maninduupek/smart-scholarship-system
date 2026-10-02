require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
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
// UPLOADED FILE CLEANUP HELPER
// ==========================================

const cleanupUploadedFiles = (files = []) => {
  for (const file of files) {
    try {
      if (
        file &&
        file.path &&
        fs.existsSync(file.path)
      ) {
        fs.unlinkSync(file.path);

        console.log(
          `Removed unused uploaded file: ${file.filename}`
        );
      }
    } catch (error) {
      console.error(
        "Failed to remove unused uploaded file:",
        error.message
      );
    }
  }
};

// ==========================================
// OBJECT ID VALIDATION HELPER
// STEP 30.8
// ==========================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// Uploaded documents are NOT publicly exposed.

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

      fullName = String(
        fullName
      ).trim();

      email = String(email)
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

      if (
        String(password).length <
        6
      ) {
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
        password:
          hashedPassword,

        // Public registration can
        // only create students.
        role: "student",
      });

      await user.save();

      return res
        .status(201)
        .json({
          message:
            "User registered successfully!",

          user: {
            id: user._id,
            fullName:
              user.fullName,
            email:
              user.email,
            role:
              user.role,
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

      email = String(email)
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
          fullName:
            user.fullName,
          email:
            user.email,
          role:
            user.role,
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

  roleMiddleware([
    "student",
  ]),

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
          student:
            req.user.id,
        });

      return res.status(200).json({
        user,
        profile,
      });
    } catch (error) {
      console.error(
        "Student profile load error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load student profile.",
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

  roleMiddleware([
    "student",
  ]),

  async (req, res) => {
    try {
      let {
        university,
        course,
        academicYear,
        gpa,
      } = req.body;

      if (
        university ===
          undefined ||
        course ===
          undefined ||
        academicYear ===
          undefined ||
        gpa ===
          undefined ||
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

      university = String(
        university
      ).trim();

      course = String(
        course
      ).trim();

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
        Number(
          academicYear
        );

      const gpaNumber =
        Number(gpa);

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

      const profile =
        await StudentProfile.findOneAndUpdate(
          {
            student:
              req.user.id,
          },

          {
            student:
              req.user.id,
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
            runValidators:
              true,
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
      let {
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
        !title ||
        !provider ||
        !description ||
        !deadline ||
        !eligibility
      ) {
        return res.status(400).json({
          message:
            "Title, provider, description, deadline and eligibility are required.",
        });
      }

      title = String(
        title
      ).trim();

      provider = String(
        provider
      ).trim();

      description = String(
        description
      ).trim();

      eligibility = String(
        eligibility
      ).trim();

      requiredCourse =
        requiredCourse
          ? String(
              requiredCourse
            ).trim()
          : "";

      if (!title) {
        return res.status(400).json({
          message:
            "Scholarship title is required.",
        });
      }

      if (!provider) {
        return res.status(400).json({
          message:
            "Scholarship provider is required.",
        });
      }

      if (!description) {
        return res.status(400).json({
          message:
            "Scholarship description is required.",
        });
      }

      if (!eligibility) {
        return res.status(400).json({
          message:
            "Eligibility description is required.",
        });
      }

      // ======================================
      // AMOUNT VALIDATION
      // ======================================

      if (
        amount === undefined ||
        amount === null ||
        amount === ""
      ) {
        return res.status(400).json({
          message:
            "Scholarship amount is required.",
        });
      }

      const amountNumber =
        Number(amount);

      if (
        !Number.isFinite(
          amountNumber
        ) ||
        amountNumber <= 0
      ) {
        return res.status(400).json({
          message:
            "Scholarship amount must be greater than 0.",
        });
      }

      // ======================================
      // DEADLINE VALIDATION
      // ======================================

      const deadlineDate =
        new Date(
          deadline
        );

      if (
        Number.isNaN(
          deadlineDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid scholarship deadline.",
        });
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      if (
        deadlineDate <
        today
      ) {
        return res.status(400).json({
          message:
            "Scholarship deadline cannot be in the past.",
        });
      }

      // ======================================
      // GPA VALIDATION
      // ======================================

      let minimumGPANumber =
        0;

      if (
        minimumGPA !==
          undefined &&
        minimumGPA !==
          null &&
        minimumGPA !== ""
      ) {
        minimumGPANumber =
          Number(
            minimumGPA
          );

        if (
          !Number.isFinite(
            minimumGPANumber
          ) ||
          minimumGPANumber <
            0 ||
          minimumGPANumber >
            4
        ) {
          return res.status(400).json({
            message:
              "Minimum GPA must be between 0.00 and 4.00.",
          });
        }
      }

      // ======================================
      // ACADEMIC YEAR VALIDATION
      // ======================================

      let academicYearNumber =
        null;

      if (
        requiredAcademicYear !==
          undefined &&
        requiredAcademicYear !==
          null &&
        requiredAcademicYear !==
          ""
      ) {
        academicYearNumber =
          Number(
            requiredAcademicYear
          );

        if (
          !Number.isInteger(
            academicYearNumber
          ) ||
          academicYearNumber <
            1 ||
          academicYearNumber >
            6
        ) {
          return res.status(400).json({
            message:
              "Required academic year must be a whole number between 1 and 6.",
          });
        }
      }

      // ======================================
      // REQUIREMENTS
      // ======================================

      let cleanedRequirements =
        [];

      if (
        requirements !==
          undefined &&
        requirements !==
          null
      ) {
        if (
          !Array.isArray(
            requirements
          )
        ) {
          return res.status(400).json({
            message:
              "Scholarship requirements must be provided as a list.",
          });
        }

        cleanedRequirements =
          requirements
            .map(
              (
                requirement
              ) =>
                String(
                  requirement
                ).trim()
            )
            .filter(
              (
                requirement
              ) =>
                requirement !==
                ""
            );
      }

      const scholarship =
        new Scholarship({
          title,
          provider,

          providerUser:
            req.user.id,

          description,

          amount:
            amountNumber,

          deadline:
            deadlineDate,

          eligibility,

          minimumGPA:
            minimumGPANumber,

          requiredAcademicYear:
            academicYearNumber,

          requiredCourse,

          requirements:
            cleanedRequirements,

          status:
            "active",
        });

      await scholarship.save();

      return res.status(201).json({
        message:
          "Scholarship created successfully!",

        scholarship,
      });
    } catch (error) {
      console.error(
        "Create scholarship error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create scholarship.",
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
          status:
            "active",
        }).sort({
          createdAt:
            -1,
        });

      return res.status(200).json({
        scholarships,
      });
    } catch (error) {
      console.error(
        "Scholarship list error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch scholarships.",
      });
    }
  }
);

// ==========================================
// PROVIDER / ADMIN - MANAGE SCHOLARSHIPS
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
        req.user.role ===
        "admin"
      ) {
        scholarships =
          await Scholarship.find().sort({
            createdAt:
              -1,
          });
      } else {
        scholarships =
          await Scholarship.find({
            providerUser:
              req.user.id,
          }).sort({
            createdAt:
              -1,
          });
      }

      return res.status(200).json({
        scholarships,
      });
    } catch (error) {
      console.error(
        "Provider scholarship load error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch provider scholarships.",
      });
    }
  }
);

// ==========================================
// STUDENT - CHECK ELIGIBILITY
// STEP 30.8
// ==========================================

app.get(
  "/api/scholarships/:id/eligibility",

  authMiddleware,

  roleMiddleware([
    "student",
  ]),

  async (req, res) => {
    try {
      // ======================================
      // ID VALIDATION
      // ======================================

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid scholarship ID.",
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

      // ======================================
      // STATUS
      // ======================================

      if (
        scholarship.status !==
        "active"
      ) {
        return res.status(403).json({
          message:
            "This scholarship is currently closed.",
        });
      }

      // ======================================
      // DEADLINE
      // ======================================

      if (
        new Date(
          scholarship.deadline
        ) < new Date()
      ) {
        return res.status(403).json({
          message:
            "The application deadline for this scholarship has passed.",
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
            "Please complete your student profile before checking eligibility.",
        });
      }

      const reasons = [];

      // ======================================
      // GPA
      // ======================================

      if (
        scholarship.minimumGPA >
          0 &&
        (
          profile.gpa ===
            undefined ||
          profile.gpa ===
            null ||
          profile.gpa <
            scholarship.minimumGPA
        )
      ) {
        reasons.push(
          `Minimum GPA required is ${scholarship.minimumGPA}. Your GPA is ${
            profile.gpa ??
            "not provided"
          }.`
        );
      }

      // ======================================
      // ACADEMIC YEAR
      // ======================================

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

      // ======================================
      // COURSE
      // ======================================

      if (
        scholarship.requiredCourse &&
        scholarship.requiredCourse
          .trim() !== ""
      ) {
        const studentCourse =
          (
            profile.course ||
            ""
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

        message:
          eligible
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
      console.error(
        "Eligibility check error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to check scholarship eligibility.",
      });
    }
  }
);

// ==========================================
// GET SINGLE SCHOLARSHIP
// STEP 30.8 ACCESS CONTROL
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
      // ======================================
      // ID VALIDATION
      // ======================================

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid scholarship ID.",
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

      // ======================================
      // STUDENT ACCESS
      // ======================================

      if (
        req.user.role ===
        "student"
      ) {
        if (
          scholarship.status !==
          "active"
        ) {
          return res.status(403).json({
            message:
              "This scholarship is not currently available.",
          });
        }
      }

      // ======================================
      // PROVIDER ACCESS
      // ======================================

      if (
        req.user.role ===
        "provider"
      ) {
        if (
          !scholarship.providerUser ||
          scholarship.providerUser.toString() !==
            req.user.id
        ) {
          return res.status(403).json({
            message:
              "You are not allowed to access this scholarship.",
          });
        }
      }

      return res.status(200).json({
        scholarship,
      });
    } catch (error) {
      console.error(
        "Scholarship details error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch scholarship.",
      });
    }
  }
);

// ==========================================
// UPDATE SCHOLARSHIP
// STEP 30.8 ID + OWNERSHIP CHECK
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
      // ======================================
      // ID VALIDATION
      // ======================================

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid scholarship ID.",
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

      // ======================================
      // OWNERSHIP
      // ======================================

      if (
        req.user.role ===
          "provider" &&
        (
          !scholarship.providerUser ||
          scholarship.providerUser.toString() !==
            req.user.id
        )
      ) {
        return res.status(403).json({
          message:
            "You can only edit your own scholarships.",
        });
      }

      let {
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

      // ======================================
      // TITLE
      // ======================================

      if (
        title !==
        undefined
      ) {
        title = String(
          title
        ).trim();

        if (!title) {
          return res.status(400).json({
            message:
              "Scholarship title cannot be empty.",
          });
        }

        scholarship.title =
          title;
      }

      // ======================================
      // PROVIDER
      // ======================================

      if (
        provider !==
        undefined
      ) {
        provider = String(
          provider
        ).trim();

        if (!provider) {
          return res.status(400).json({
            message:
              "Scholarship provider cannot be empty.",
          });
        }

        scholarship.provider =
          provider;
      }

      // ======================================
      // DESCRIPTION
      // ======================================

      if (
        description !==
        undefined
      ) {
        description = String(
          description
        ).trim();

        if (!description) {
          return res.status(400).json({
            message:
              "Scholarship description cannot be empty.",
          });
        }

        scholarship.description =
          description;
      }

      // ======================================
      // AMOUNT
      // ======================================

      if (
        amount !==
        undefined
      ) {
        if (
          amount === null ||
          amount === ""
        ) {
          return res.status(400).json({
            message:
              "Scholarship amount is required.",
          });
        }

        const amountNumber =
          Number(amount);

        if (
          !Number.isFinite(
            amountNumber
          ) ||
          amountNumber <= 0
        ) {
          return res.status(400).json({
            message:
              "Scholarship amount must be greater than 0.",
          });
        }

        scholarship.amount =
          amountNumber;
      }

      // ======================================
      // DEADLINE
      // ======================================

      if (
        deadline !==
        undefined
      ) {
        if (!deadline) {
          return res.status(400).json({
            message:
              "Scholarship deadline is required.",
          });
        }

        const deadlineDate =
          new Date(
            deadline
          );

        if (
          Number.isNaN(
            deadlineDate.getTime()
          )
        ) {
          return res.status(400).json({
            message:
              "Please enter a valid scholarship deadline.",
          });
        }

        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );

        if (
          deadlineDate <
          today
        ) {
          return res.status(400).json({
            message:
              "Scholarship deadline cannot be in the past.",
          });
        }

        scholarship.deadline =
          deadlineDate;
      }

      // ======================================
      // ELIGIBILITY
      // ======================================

      if (
        eligibility !==
        undefined
      ) {
        eligibility = String(
          eligibility
        ).trim();

        if (!eligibility) {
          return res.status(400).json({
            message:
              "Eligibility description cannot be empty.",
          });
        }

        scholarship.eligibility =
          eligibility;
      }

      // ======================================
      // GPA
      // ======================================

      if (
        minimumGPA !==
        undefined
      ) {
        if (
          minimumGPA ===
            "" ||
          minimumGPA ===
            null
        ) {
          scholarship.minimumGPA =
            0;
        } else {
          const minimumGPANumber =
            Number(
              minimumGPA
            );

          if (
            !Number.isFinite(
              minimumGPANumber
            ) ||
            minimumGPANumber <
              0 ||
            minimumGPANumber >
              4
          ) {
            return res.status(400).json({
              message:
                "Minimum GPA must be between 0.00 and 4.00.",
            });
          }

          scholarship.minimumGPA =
            minimumGPANumber;
        }
      }

      // ======================================
      // ACADEMIC YEAR
      // ======================================

      if (
        requiredAcademicYear !==
        undefined
      ) {
        if (
          requiredAcademicYear ===
            "" ||
          requiredAcademicYear ===
            null
        ) {
          scholarship.requiredAcademicYear =
            null;
        } else {
          const academicYearNumber =
            Number(
              requiredAcademicYear
            );

          if (
            !Number.isInteger(
              academicYearNumber
            ) ||
            academicYearNumber <
              1 ||
            academicYearNumber >
              6
          ) {
            return res.status(400).json({
              message:
                "Required academic year must be a whole number between 1 and 6.",
            });
          }

          scholarship.requiredAcademicYear =
            academicYearNumber;
        }
      }

      // ======================================
      // COURSE
      // ======================================

      if (
        requiredCourse !==
        undefined
      ) {
        scholarship.requiredCourse =
          requiredCourse ===
            null
            ? ""
            : String(
                requiredCourse
              ).trim();
      }

      // ======================================
      // REQUIREMENTS
      // ======================================

      if (
        requirements !==
        undefined
      ) {
        if (
          !Array.isArray(
            requirements
          )
        ) {
          return res.status(400).json({
            message:
              "Scholarship requirements must be provided as a list.",
          });
        }

        scholarship.requirements =
          requirements
            .map(
              (
                requirement
              ) =>
                String(
                  requirement
                ).trim()
            )
            .filter(
              (
                requirement
              ) =>
                requirement !==
                ""
            );
      }

      await scholarship.save();

      return res.status(200).json({
        message:
          "Scholarship updated successfully!",

        scholarship,
      });
    } catch (error) {
      console.error(
        "Update scholarship error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update scholarship.",
      });
    }
  }
);

// ==========================================
// CHANGE SCHOLARSHIP STATUS
// STEP 30.8
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
      // ======================================
      // ID VALIDATION
      // ======================================

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid scholarship ID.",
        });
      }

      const {
        status,
      } = req.body;

      if (
        ![
          "active",
          "closed",
        ].includes(
          status
        )
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

      // ======================================
      // PROVIDER OWNERSHIP
      // ======================================

      if (
        req.user.role ===
          "provider" &&
        (
          !scholarship.providerUser ||
          scholarship.providerUser.toString() !==
            req.user.id
        )
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
      console.error(
        "Scholarship status update error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update scholarship status.",
      });
    }
  }
);

// ==========================================
// STUDENT - SUBMIT APPLICATION
// STEP 30.7 + 30.8
// ==========================================

app.post(
  "/api/applications",

  authMiddleware,

  roleMiddleware([
    "student",
  ]),

  upload.array(
    "documents",
    5
  ),

  async (req, res) => {
    let applicationSaved =
      false;

    try {
      const {
        scholarshipId,
        statement,
      } = req.body;

      // ======================================
      // SCHOLARSHIP ID
      // ======================================

      if (
        !scholarshipId ||
        !isValidObjectId(
          scholarshipId
        )
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "Invalid scholarship.",
        });
      }

      const scholarship =
        await Scholarship.findById(
          scholarshipId
        );

      if (!scholarship) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(404).json({
          message:
            "Scholarship not found.",
        });
      }

      // ======================================
      // ACTIVE STATUS
      // ======================================

      if (
        scholarship.status !==
        "active"
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "This scholarship is currently closed.",
        });
      }

      // ======================================
      // DEADLINE
      // ======================================

      const currentTime =
        new Date();

      const scholarshipDeadline =
        new Date(
          scholarship.deadline
        );

      if (
        scholarshipDeadline <
        currentTime
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "The application deadline for this scholarship has passed.",
        });
      }

      // ======================================
      // DUPLICATE APPLICATION
      // ======================================

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
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "You have already applied for this scholarship.",
        });
      }

      // ======================================
      // STUDENT ACCOUNT
      // ======================================

      const user =
        await User.findById(
          req.user.id
        ).select(
          "fullName email"
        );

      if (!user) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(404).json({
          message:
            "Student account not found.",
        });
      }

      // ======================================
      // STUDENT PROFILE
      // ======================================

      const profile =
        await StudentProfile.findOne({
          student:
            req.user.id,
        });

      if (!profile) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "Please complete your student profile before applying.",
        });
      }

      if (
        !profile.university ||
        !profile.course ||
        profile.academicYear ===
          undefined ||
        profile.academicYear ===
          null ||
        profile.gpa ===
          undefined ||
        profile.gpa ===
          null
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "Please complete your student profile before applying.",
        });
      }

      // ======================================
      // ELIGIBILITY
      // ======================================

      const eligibilityReasons =
        [];

      if (
        scholarship.minimumGPA >
          0 &&
        profile.gpa <
          scholarship.minimumGPA
      ) {
        eligibilityReasons.push(
          `Minimum GPA required is ${scholarship.minimumGPA}. Your GPA is ${profile.gpa}.`
        );
      }

      if (
        scholarship.requiredAcademicYear &&
        profile.academicYear !==
          scholarship.requiredAcademicYear
      ) {
        eligibilityReasons.push(
          `Required academic year is Year ${scholarship.requiredAcademicYear}. Your academic year is Year ${profile.academicYear}.`
        );
      }

      if (
        scholarship.requiredCourse &&
        scholarship.requiredCourse
          .trim() !== ""
      ) {
        const studentCourse =
          profile.course
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
            `Required course is ${scholarship.requiredCourse}. Your course is ${profile.course}.`
          );
        }
      }

      if (
        eligibilityReasons.length >
        0
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(403).json({
          message:
            "You are not eligible to apply for this scholarship.",

          reasons:
            eligibilityReasons,
        });
      }

      // ======================================
      // STATEMENT
      // ======================================

      if (
        !statement ||
        statement.trim() ===
          ""
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "Statement of purpose is required.",
        });
      }

      const cleanedStatement =
        statement.trim();

      if (
        cleanedStatement.length <
        20
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "Statement of purpose must contain at least 20 characters.",
        });
      }

      // ======================================
      // DOCUMENT METADATA
      // ======================================

      const uploadedDocuments =
        (
          req.files ||
          []
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

      // ======================================
      // CREATE APPLICATION
      // ======================================

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
            cleanedStatement,

          documents:
            uploadedDocuments,

          status:
            "submitted",
        });

      await application.save();

      applicationSaved =
        true;

      return res.status(201).json({
        message:
          "Application submitted successfully!",

        application,
      });
    } catch (error) {
      if (
        !applicationSaved
      ) {
        cleanupUploadedFiles(
          req.files
        );
      }

      console.error(
        "Application submission error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to submit application.",
      });
    }
  }
);

// ==========================================
// SECURE DOCUMENT ACCESS
// STEP 30.8 ID + ACCESS CHECKS
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

      // ======================================
      // APPLICATION ID
      // ======================================

      if (
        !isValidObjectId(
          applicationId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid application ID.",
        });
      }

      if (
        !isValidObjectId(
          documentId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid document ID.",
        });
      }

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

      // ======================================
      // STUDENT ACCESS
      // ======================================

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

      // ======================================
      // PROVIDER ACCESS
      // ======================================

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
      console.error(
        "Document access error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to open document.",
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

  roleMiddleware([
    "student",
  ]),

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
            createdAt:
              -1,
          });

      return res.status(200).json({
        applications,
      });
    } catch (error) {
      console.error(
        "Student applications error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch your applications.",
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

      // Admin sees all applications
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
              createdAt:
                -1,
            });
      } else {
        // Provider only sees applications
        // for scholarships they own.

        const providerScholarships =
          await Scholarship.find({
            providerUser:
              req.user.id,
          }).select(
            "_id"
          );

        const scholarshipIds =
          providerScholarships.map(
            (
              scholarship
            ) =>
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
              createdAt:
                -1,
            });
      }

      return res.status(200).json({
        applications,
      });
    } catch (error) {
      console.error(
        "Provider applications error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch applications.",
      });
    }
  }
);

// ==========================================
// PROVIDER / ADMIN - UPDATE APPLICATION STATUS
// STEP 30.8 ID + OWNERSHIP CHECK
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
      // ======================================
      // ID VALIDATION
      // ======================================

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid application ID.",
        });
      }

      const {
        status,
      } = req.body;

      const allowedStatuses =
        [
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

      // ======================================
      // PROVIDER OWNERSHIP
      // ======================================

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
      console.error(
        "Application status update error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update application status.",
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

  roleMiddleware([
    "admin",
  ]),

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
            role:
              "student",
          }),

          User.countDocuments({
            role:
              "provider",
          }),

          Scholarship.countDocuments(),

          Scholarship.countDocuments({
            status:
              "active",
          }),

          Scholarship.countDocuments({
            status:
              "closed",
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
      console.error(
        "Admin dashboard error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load admin dashboard.",
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

  roleMiddleware([
    "admin",
  ]),

  async (req, res) => {
    try {
      const users =
        await User.find()
          .select(
            "-password"
          )
          .sort({
            createdAt:
              -1,
          });

      return res.status(200).json({
        users,
      });
    } catch (error) {
      console.error(
        "Admin users error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch users.",
      });
    }
  }
);

// ==========================================
// FILE UPLOAD / GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    // ======================================
    // MULTER ERRORS
    // ======================================

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

    // ======================================
    // INVALID FILE TYPE
    // ======================================

    if (
      error.message ===
      "Only PDF, JPG, JPEG, PNG, DOC and DOCX files are allowed."
    ) {
      return res.status(400).json({
        message:
          error.message,
      });
    }

    console.error(
      "Unexpected server error:",
      error
    );

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