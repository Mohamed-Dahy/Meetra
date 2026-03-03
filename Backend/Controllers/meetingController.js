const Meeting = require("../Models/meetingmodel");
const User = require("../Models/userModel");
const { sendEmail, analysisReadyEmail } = require("../config/email");

const createMeeting = async (req, res) => {
  try {
    const { title, description, date, time, location, participants } = req.body;

    if (!title || !description || !date || !time || !location || !participants) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ message: "At least 2 participants are required" });
    }

    const existingMeeting = await Meeting.findOne({ title });
    if (existingMeeting) {
      return res.status(400).json({ message: "Meeting already exists" });
    }

    const creator = await User.findById(req.user.id);
    if (!creator) {
      return res.status(400).json({ message: "User not found" });
    }

    const uniqueParticipantIds = [...new Set(participants.map((id) => id.toString()))];

    const foundParticipants = await User.find({
      _id: { $in: uniqueParticipantIds },
    });

    if (foundParticipants.length !== uniqueParticipantIds.length) {
      return res.status(400).json({ message: "Some participants not found" });
    }

    const meetingDate = new Date(date);
    if (Number.isNaN(meetingDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    if (meetingDate < new Date()) {
      return res.status(400).json({ message: "Date cannot be in the past" });
    }

    if (!location.trim()) {
      return res.status(400).json({ message: "Location is required" });
    }

    const newMeeting = new Meeting({
      title,
      description,
      date,
      time,
      location,
      participants: uniqueParticipantIds,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    await newMeeting.save();

    creator.meetings.push(newMeeting._id);
    await creator.save();

    await User.updateMany(
      { _id: { $in: uniqueParticipantIds } },
      { $addToSet: { meetings: newMeeting._id } }
    );

    // Send email to each participant individually using Resend
    for (const participant of foundParticipants) {
      if (participant.email) {
        await sendEmail(
          participant.email,
          `New Meetra Meeting: ${title}`,
          analysisReadyEmail(title)
        );
      }
    }

    return res.status(201).json({ message: "Meeting created successfully", meeting: newMeeting });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const { title, description, date, time, location, participants } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    meeting.title = title;
    meeting.description = description;
    meeting.date = date;
    meeting.time = time;
    meeting.location = location;
    meeting.participants = participants;
    meeting.updatedBy = req.user.id;
    await meeting.save();

    // Notify participants about meeting update
    const updatedParticipants = await User.find({ _id: { $in: participants } });
    for (const participant of updatedParticipants) {
      if (participant.email) {
        await sendEmail(
          participant.email,
          `Updated Meetra Meeting: ${title}`,
          `<p>The meeting "${title}" has been updated. Check your dashboard for details.</p>`
        );
      }
    }

    return res.status(200).json({ message: "Meeting updated successfully", meeting });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Notify participants about cancellation before deletion
    const participants = await User.find({ _id: { $in: meeting.participants } });
    for (const participant of participants) {
      if (participant.email) {
        await sendEmail(
          participant.email,
          `Canceled Meetra Meeting: ${meeting.title}`,
          `<p>The meeting "${meeting.title}" has been canceled.</p>`
        );
      }
    }

    await meeting.deleteOne();

    await User.updateMany(
      { _id: { $in: meeting.participants } },
      { $pull: { meetings: meeting._id } }
    );
    await User.updateMany(
      { _id: meeting.createdBy },
      { $pull: { meetings: meeting._id } }
    );
    await User.updateMany(
      { _id: meeting.updatedBy },
      { $pull: { meetings: meeting._id } }
    );

    return res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    return res.status(200).json({ meeting });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find();
    return res.status(200).json({ meetings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createMeeting, updateMeeting, deleteMeeting, getMeetingById, getMeetings };