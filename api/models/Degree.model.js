const mongoose = require("mongoose");

const DegreeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentDegree: {
      type: Number,
      required: true,
      min: 0,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate: one degree per student per exam
DegreeSchema.index({ userId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model("Degree", DegreeSchema);
