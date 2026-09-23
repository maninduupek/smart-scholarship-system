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

    eligibility: {
      type: String,
      required: true,
    },

    requirements: {
      type: [String],
      default: [],
    },

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