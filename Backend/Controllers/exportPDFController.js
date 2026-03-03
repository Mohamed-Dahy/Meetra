const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Meeting = require("../Models/meetingmodel");

const exportPDF = async (req, res) => {
  try {
    const { meetingId } = req.body;

    if (!meetingId) {
      return res
        .status(400)
        .json({ message: "meetingId is required" });
    }

    const meeting = await Meeting.findById(meetingId).populate(
      "participants",
      "name email"
    );

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const pdfsDir = path.join(__dirname, "..", "pdfs");
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }

    const fileName = `meeting-${meeting._id}.pdf`;
    const filePath = path.join(pdfsDir, fileName);

    const pdfDoc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);

    pdfDoc.pipe(writeStream);

    pdfDoc
      .fontSize(18)
      .text("Meetra - Meeting Transcript", { align: "center" })
      .moveDown();

    pdfDoc
      .fontSize(14)
      .text(`Title: ${meeting.title}`)
      .text(`Date: ${meeting.date.toISOString().split("T")[0]}`)
      .text(`Time: ${meeting.time}`)
      .text(`Location: ${meeting.location}`)
      .moveDown();

    if (meeting.participants && meeting.participants.length > 0) {
      pdfDoc
        .fontSize(12)
        .text(
          "Participants: " +
            meeting.participants
              .map((p) => p.name || p.email)
              .join(", ")
        )
        .moveDown();
    }

    pdfDoc
      .fontSize(14)
      .text(`Transcript: ${meeting.transcript.text}`, { underline: true })
      .moveDown();

    pdfDoc.fontSize(12).text(meeting.transcript || "No transcript available.");

    pdfDoc.end();

    writeStream.on("finish", () => {
      return res.status(200).json({
        message: "PDF exported successfully",
        meetingId: meeting._id,
        fileName,
        filePath,
      });
    });

    writeStream.on("error", (err) => {
      console.error("Error writing PDF file:", err);
      return res.status(500).json({
        message: "Failed to write PDF file",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { exportPDF };