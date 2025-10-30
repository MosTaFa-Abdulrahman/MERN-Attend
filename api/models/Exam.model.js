const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      enum: [
        "prep_1",
        "prep_2",
        "prep_3",
        "secondary_1",
        "secondary_2",
        "secondary_3",
      ],
      required: true,
    },
    fullDegree: {
      type: Number,
      required: true,
      min: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Unique: one exam per className
ExamSchema.index({ examName: 1, className: 1 }, { unique: true });

module.exports = mongoose.model("Exam", ExamSchema);
