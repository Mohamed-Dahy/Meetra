const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please Enter a Valid Email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [5, "Password must be at least 5 characters long"],
    },

    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    bio: {
      type: String,
      maxlength: 512,
      default: "",
    },
    interests: [
      {
        type: String,
      },
    ],
    meetings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;