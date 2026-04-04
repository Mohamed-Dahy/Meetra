const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Workspace & Ownership
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Transcription & Status
    transcript: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "processing", "completed", "canceled"],
      default: "upcoming",
    },

    // Optional future AI fields (ready for analysis)
    summary: {
      type: String,
      default: "",
    },
    actionItems: [
      {
        type: String,
        default: [],
      },
    ],
    keyDecisions: [
      {
        type: String,
        default: [],
      },
    ],
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt & updatedAt
  }
);

// Optional: Add index for better performance
meetingSchema.index({ workspace: 1, title: 1 }); // Prevent duplicate titles per workspace
meetingSchema.index({ createdBy: 1 });
meetingSchema.index({ status: 1 });

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;