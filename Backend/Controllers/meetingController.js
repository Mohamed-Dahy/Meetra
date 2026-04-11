const Meeting = require("../Models/meetingModel");
const User = require("../Models/userModel");
const Workspace = require("../Models/workspaceModel");
const { sendEmail, analysisReadyEmail } = require("../config/email");

const createMeeting = async (req, res) => {
  try {
    const { title, description, date, time, location, participants, workspaceId } = req.body;

    if (!title || !description || !date || !time || !location || !participants || !workspaceId) {
      return res.status(400).json({ message: "All fields including workspaceId are required" });
    }

    if (!Array.isArray(participants) || participants.length < 1) {
      return res.status(400).json({ message: "At least 1 participant is required" });
    }

    // Verify workspace exists and user owns it
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only workspace owner can create meetings in this workspace" });
    }

    const existingMeeting = await Meeting.findOne({ title, workspace: workspaceId });
    if (existingMeeting) {
      return res.status(400).json({ message: "Meeting already exists in this workspace" });
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

    // Verify all participants are connected with the creator
    const creatorConnections = creator.connections.map(id => id.toString());
    for (const participantId of uniqueParticipantIds) {
      if (!creatorConnections.includes(participantId)) {
        const participantName = foundParticipants.find(p => p._id.toString() === participantId)?.name || participantId;
        return res.status(403).json({ 
          message: `You are not connected with ${participantName}. Only add connected users to meetings.` 
        });
      }
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
      workspace: workspaceId,
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

    // Add meeting to workspace
    await Workspace.findByIdAndUpdate(
      workspaceId,
      { $addToSet: { meetings: newMeeting._id } }
    );

    // Send email to each participant individually
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

    // Verify user has permission to update meeting in workspace
    const workspace = await Workspace.findById(meeting.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    if (workspace.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only workspace owner can update this meeting" });
    }

    // If participants are being updated, verify they are all connected
    if (participants && Array.isArray(participants)) {
      const creator = await User.findById(req.user.id);
      const creatorConnections = creator.connections.map(id => id.toString());
      
      for (const participantId of participants) {
        if (!creatorConnections.includes(participantId)) {
          return res.status(403).json({ 
            message: `You are not connected with participant ${participantId}. Only add connected users to meetings.` 
          });
        }
      }
    }

    meeting.title = title || meeting.title;
    meeting.description = description || meeting.description;
    meeting.date = date || meeting.date;
    meeting.time = time || meeting.time;
    meeting.location = location || meeting.location;
    if (participants) meeting.participants = participants;
    meeting.updatedBy = req.user.id;
    await meeting.save();

    // Notify participants about meeting update
    const updatedParticipants = await User.find({ _id: { $in: meeting.participants } });
    for (const participant of updatedParticipants) {
      if (participant.email) {
        await sendEmail(
          participant.email,
          `Updated Meetra Meeting: ${title || meeting.title}`,
          `<p>The meeting "${title || meeting.title}" has been updated. Check your dashboard for details.</p>`
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

    // Verify user has permission to delete meeting in workspace
    const workspace = await Workspace.findById(meeting.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    if (workspace.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only workspace owner can delete this meeting" });
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

    // Remove meeting from workspace
    await Workspace.findByIdAndUpdate(
      meeting.workspace,
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

    // Verify user belongs to the meeting's workspace
    const workspace = await Workspace.findById(meeting.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    const userId = req.user.id.toString();
    const isMember = workspace.owner.toString() === userId ||
      workspace.members.some(m => m.userId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ meeting });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMeetings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all workspaces where the user is owner or a member
    const userWorkspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { "members.userId": userId },
      ],
    }).select("_id");

    const workspaceIds = userWorkspaces.map(w => w._id);
    const meetings = await Meeting.find({ workspace: { $in: workspaceIds } });
    return res.status(200).json({ meetings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createMeeting, updateMeeting, deleteMeeting, getMeetingById, getMeetings };