const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  transcribeAudio,
  transcribeText,
  analyzeMeeting,
} = require("../Controllers/transcriptionController");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});


router.post("/audio", protect, upload.single("file"), transcribeAudio); //done

router.post("/text", protect, transcribeText); // done

router.post("/analyze", protect, analyzeMeeting); // done

module.exports = router;