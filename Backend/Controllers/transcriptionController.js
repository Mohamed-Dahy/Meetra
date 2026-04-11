const fs = require("fs");
const path = require("path");
const genAI = require("../config/gemini");
const Meeting = require("../Models/meetingModel");
const Workspace = require("../Models/workspaceModel");

// Rejects after `ms` milliseconds — used to cap the Gemini API call so a
// large audio file can't hang the server indefinitely.
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms / 1000}s`)), ms)
    ),
  ]);

// Deletes a file and logs if it fails — never throws.
const safeUnlink = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error("Failed to delete uploaded file:", filePath, err.message);
  });
};

// Checks that the requesting user is the workspace owner OR the meeting creator.
const checkTranscriptionPermission = (workspace, meeting, userId) => {
  const uid = userId.toString();
  return (
    workspace.owner.toString() === uid ||
    meeting.createdBy.toString() === uid
  );
};

const transcribeAudio = async (req, res) => {
  try {
    const { meetingId } = req.body;

    if (!meetingId) {
      return res.status(400).json({ success: false, message: "meetingId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Audio file is required" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      safeUnlink(req.file.path);
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const workspace = await Workspace.findById(meeting.workspace);
    if (!workspace) {
      safeUnlink(req.file.path);
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    if (!checkTranscriptionPermission(workspace, meeting, req.user.id)) {
      safeUnlink(req.file.path);
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner or meeting creator can transcribe this meeting",
      });
    }

    meeting.status = "processing";
    await meeting.save();

    const filePath = req.file.path;

    // Non-blocking async read — does not stall the event loop
    const fileBuffer = await fs.promises.readFile(filePath);
    const audioBase64 = fileBuffer.toString("base64");
    const mimeType = req.file.mimetype || "audio/mp4";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Cap at 3 minutes — prevents a single large upload from hanging the server
    const result = await withTimeout(
      model.generateContent([
        { inlineData: { data: audioBase64, mimeType } },
        { text: "Transcribe this meeting audio as plain text. Be accurate and keep speaker labels if possible." },
      ]),
      180_000
    );

    const transcriptText = result?.response?.text() || "";

    meeting.transcript = transcriptText;
    meeting.status = "completed";
    await meeting.save();

    safeUnlink(filePath);

    return res.status(200).json({
      success: true,
      message: "Audio transcribed successfully",
      meetingId: meeting._id,
      transcript: transcriptText,
    });
  } catch (error) {
    console.error("Error in transcribeAudio:", error);

    if (req.file?.path) safeUnlink(req.file.path);

    const isTimeout = error.message?.includes("timed out");
    return res.status(isTimeout ? 504 : 500).json({
      success: false,
      message: isTimeout ? "Transcription timed out — try a shorter audio file" : "Failed to transcribe audio",
    });
  }
};

const transcribeText = async (req, res) => {
  try {
    const { meetingId, text } = req.body;

    if (!meetingId) {
      return res.status(400).json({ success: false, message: "meetingId is required" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Transcript text is required and cannot be empty" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const workspace = await Workspace.findById(meeting.workspace);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    if (!checkTranscriptionPermission(workspace, meeting, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner or meeting creator can add a transcript to this meeting",
      });
    }

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
    return res.status(500).json({ success: false, message: "Failed to save transcript" });
  }
};

const analyzeMeeting = async (req, res) => {
  try {
    const { meetingId } = req.body;

    if (!meetingId) {
      return res.status(400).json({ success: false, message: "meetingId is required" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    if (!meeting.transcript || !meeting.transcript.trim()) {
      return res.status(400).json({ success: false, message: "Meeting has no transcript to analyze. Transcribe it first." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an AI meeting analyst. Analyze the following meeting transcript and return a JSON object with exactly these fields:
- "summary": a 2-3 sentence summary of the meeting
- "actionItems": an array of strings, each a specific action item or task
- "keyDecisions": an array of strings, each a key decision made in the meeting
- "sentiment": one of "positive", "neutral", or "negative" based on the overall tone
- "healthScore": an integer from 0 to 100 rating how productive this meeting was

Return ONLY valid JSON with no markdown, no code blocks, no extra text.

Transcript:
${meeting.transcript}`;

    // Cap at 60 seconds for analysis
    const result = await withTimeout(model.generateContent(prompt), 60_000);
    const rawText = result?.response?.text() || "";

    let analysis;
    try {
      const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ success: false, message: "Failed to parse AI response. Try again." });
    }

    meeting.summary = typeof analysis.summary === "string" ? analysis.summary : "";
    meeting.actionItems = Array.isArray(analysis.actionItems) ? analysis.actionItems : [];
    meeting.keyDecisions = Array.isArray(analysis.keyDecisions) ? analysis.keyDecisions : [];
    meeting.sentiment = ["positive", "neutral", "negative"].includes(analysis.sentiment)
      ? analysis.sentiment
      : "neutral";
    meeting.healthScore =
      typeof analysis.healthScore === "number"
        ? Math.min(100, Math.max(0, Math.round(analysis.healthScore)))
        : 0;
    await meeting.save();

    return res.status(200).json({
      success: true,
      message: "Meeting analyzed successfully",
      meetingId: meeting._id,
      analysis: {
        summary: meeting.summary,
        actionItems: meeting.actionItems,
        keyDecisions: meeting.keyDecisions,
        sentiment: meeting.sentiment,
        healthScore: meeting.healthScore,
      },
    });
  } catch (error) {
    console.error("Error in analyzeMeeting:", error);
    const isTimeout = error.message?.includes("timed out");
    return res.status(isTimeout ? 504 : 500).json({
      success: false,
      message: isTimeout ? "Analysis timed out — try again" : "Failed to analyze meeting",
    });
  }
};

module.exports = { transcribeAudio, transcribeText, analyzeMeeting };
