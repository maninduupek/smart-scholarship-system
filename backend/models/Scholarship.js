const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    provider: {
      type: String,
      required: true,
    },

    providerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    description: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    // General eligibility description
    eligibility: {
      type: String,
      required: true,
    },

    // ==========================================
    // STRUCTURED ELIGIBILITY CRITERIA
    // ==========================================

    minimumGPA: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },

    requiredAcademicYear: {
      type: Number,
      min: 1,
      max: 6,
      default: null,
    },

    requiredCourse: {
      type: String,
      default: "",
    },

    // ==========================================
    // REQUIRED DOCUMENTS
    // ==========================================

    requirements: {
      type: [String],
      default: [],
    },

    // ==========================================
    // SCHOLARSHIP STATUS
    // ==========================================

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Scholarship = mongoose.model(
  "Scholarship",
  scholarshipSchema
);

module.exports = Scholarship;