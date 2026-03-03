const fs = require("fs");
const path = require("path");
const genAI = require("../config/gemini");
const Meeting = require("../Models/meetingmodel");

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

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // Mark meeting as processing while we call Groq
    meeting.status = "processing";
    await meeting.save();

    const filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);
    const audioBase64 = fileBuffer.toString("base64");
    const mimeType = req.file.mimetype || "audio/mp4";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: audioBase64,
          mimeType,
        },
      },
      { text: "Transcribe this meeting audio as plain text." },
    ]);

    const transcriptText = result?.response?.text() || "";

    meeting.transcript = transcriptText;
    meeting.status = "processing";
    await meeting.save();

    return res.status(200).json({
      success: true,
      message: "Audio transcribed successfully",
      meetingId: meeting._id,
      transcript: transcriptText,
    });
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to transcribe audio",
    });
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
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
        message: "Transcript text is required",
      });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    meeting.transcript = text.trim();
    meeting.status = "processing";
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

