const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    // UserId
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ClassName
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

    // QR
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },

    attendedStudents: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        attendedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Index for faster queries
AttendanceSchema.index({ qrCode: 1 });
AttendanceSchema.index({ className: 1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);
