const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  transcribeAudio,
  transcribeText,
} = require("../Controllers/transcriptionController");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max for Whisper on Groq
  },
});

router.post("/audio", protect, upload.single("audio"), transcribeAudio);
router.post("/text", protect, transcribeText);

module.exports = router;

