const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scholarship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholarship",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    university: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },

    academicYear: {
      type: Number,
      required: true,
    },

    statement: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "under review",
        "selected",
        "rejected",
      ],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

module.exports = Application;