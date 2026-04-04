const fs = require("fs");
const path = require("path");
const genAI = require("../config/gemini");
const Meeting = require("../Models/meetingmodel");
const Workspace = require("../Models/workspaceModel");
const User = require("../Models/userModel");

const transcribeAudio = async (req, res) => {
  try {
    const { meetingId } = req.body;

    if (!meetingId) {
      return res.status(400).json({
        success: false,
        message: "meetingId is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    // Fetch meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // === Workspace & Permission Validation (Same as createMeeting) ===
    const workspace = await Workspace.findById(meeting.workspace);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    // Only workspace owner OR meeting creator can transcribe
    const owner = await User.findById(workspace.owner);
    if (workspace.owner.toString() !==  owner._id.toString() && 
        meeting.createdBy.toString() !==  owner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only workspace owner or meeting creator can transcribe this meeting",
      });
    }

    // Optional: Check if user is a participant (recommended for security)
    const isParticipant = meeting.participants.some(
      (p) => p.toString() === owner._id.toString()
    );
    if (!isParticipant && workspace.owner.toString() !== owner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You must be a participant or owner to transcribe this meeting",
      });
    }

    // Mark as processing
    meeting.status = "processing";
    await meeting.save();

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const audioBase64 = fileBuffer.toString("base64");
    const mimeType = req.file.mimetype || "audio/mp4";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: audioBase64,
          mimeType,
        },
      },
      { text: "Transcribe this meeting audio as plain text. Be accurate and keep speaker labels if possible." },
    ]);

    const transcriptText = result?.response?.text() || "";

    // Save transcript
    meeting.transcript = transcriptText;
    meeting.status = "completed";   // Changed from "processing" to "completed"
    await meeting.save();

    // Clean up uploaded file
    fs.unlink(filePath, () => {});

    return res.status(200).json({
      success: true,
      message: "Audio transcribed successfully",
      meetingId: meeting._id,
      transcript: transcriptText,
    });
  } catch (error) {
    console.error("Error in transcribeAudio:", error);

    // Cleanup file even on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(500).json({
      success: false,
      message: "Failed to transcribe audio",
    });
  }
};

const transcribeText = async (req, res) => {
  try {
    const { meetingId, text } = req.body;

    if (!meetingId) {
      return res.status(400).json({
        success: false,
        message: "meetingId is required",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Transcript text is required and cannot be empty",
      });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // === Same Workspace & Permission Validation ===
    const workspace = await Workspace.findById(meeting.workspace);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }
    const owner = await User.findById(workspace.owner);
    if (workspace.owner.toString() !== owner._id.toString() && 
        meeting.createdBy.toString() !== owner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only workspace owner or meeting creator can add transcript to this meeting",
      });
    }

    const isParticipant = meeting.participants.some(
      (p) => p.toString() === owner._id.toString()
    );
    if (!isParticipant && workspace.owner.toString() !== owner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You must be a participant or owner to add transcript",
      });
    }

    // Save manual transcript
    meeting.transcript = text.trim();
    meeting.status = "completed";
    await meeting.save();

    return res.status(200).json({
      success: true,
      message: "Transcript saved successfully",
      meetingId: meeting._id,
      transcript: meeting.transcript,
    });
  } catch (error) {
    console.error("Error in transcribeText:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save transcript",
    });
  }
};

module.exports = {
  transcribeAudio,
  transcribeText,
};