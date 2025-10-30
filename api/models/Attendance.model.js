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

// In your AttendanceSchema, add this compound index to prevent duplicate daily attendance
AttendanceSchema.index(
  { qrCode: 1, "attendedStudents.userId": 1 },
  { unique: false }
);

// Better: Add a method to check if student attended today
AttendanceSchema.methods.hasAttendedToday = function (userId) {
  return this.attendedStudents.some(
    (s) => s.userId.toString() === userId.toString() && isToday(s.attendedAt)
  );
};

module.exports = mongoose.model("Attendance", AttendanceSchema);
