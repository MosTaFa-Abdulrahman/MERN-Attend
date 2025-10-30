const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
      trim: true,
    },
    profilePic: {
      type: String,
      default: "",
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
      required: function () {
        return this.role === "USER"; // Only required for regular users
      },
    },
    role: {
      type: String,
      enum: ["USER", , "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
