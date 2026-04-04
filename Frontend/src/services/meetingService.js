// src/services/meetingService.js
import api from "../api";

/**
 * Get all meetings (for current user)
 */
export async function getAllMeetings() {
  try {
    const res = await api.get("/meetra/meeting/get-meetings");   // Updated route to match your backend structure
    return res.data.meetings;
  } catch (err) {
    console.error("Error fetching meetings:", err.response?.data?.message || err.message);
    throw err;
  }
}

/**
 * Create a new meeting (with workspace support)
 * @param {Object} meetingData
 */
export async function createMeeting(meetingData) {
  try {
    const res = await api.post("/meetra/meeting/create", meetingData);   // Full object now
    return res.data.meeting;
  } catch (err) {
    console.error("Error creating meeting:", err.response?.data?.message || err.message);
    throw err;
  }
}

/**
 * Get single meeting by ID (with populated data)
 */
export async function getMeetingById(id) {
  try {
    const res = await api.get(`/meetra/meeting/get-meeting/${id}`);
    return res.data.meeting;
  } catch (err) {
    console.error("Error fetching meeting:", err.response?.data?.message || err.message);
    throw err;
  }
}

/**
 * Update a meeting
 */
export async function updateMeeting(id, updateData) {
  try {
    const res = await api.put(`/meetra/meeting/update/${id}`, updateData);
    return res.data.meeting;
  } catch (err) {
    console.error("Error updating meeting:", err.response?.data?.message || err.message);
    throw err;
  }
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(id) {
  try {
    await api.delete(`/meetra/meeting/delete/${id}`);
    return true;
  } catch (err) {
    console.error("Error deleting meeting:", err.response?.data?.message || err.message);
    throw err;
  }
}

/**
 * NEW: Transcribe audio for a meeting
 */
export async function transcribeAudio(meetingId, audioFile) {
  const formData = new FormData();
  formData.append("meetingId", meetingId);
  formData.append("file", audioFile);

  try {
    const res = await api.post("/api/transcription/audio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error transcribing audio:", err.response?.data?.message || err.message);
    throw err;
  }
}

/**
 * NEW: Save manual transcript
 */
export async function transcribeText(meetingId, text) {
  try {
    const res = await api.post("/api/transcription/text", { meetingId, text });
    return res.data;
  } catch (err) {
    console.error("Error saving transcript:", err.response?.data?.message || err.message);
    throw err;
  }
}

/**
 * NEW: Export meeting as PDF
 */
export async function exportMeetingPDF(meetingId) {
  try {
    const res = await api.post("/meetra/api/export/export-pdf", { meetingId });
    return res.data;
  } catch (err) {
    console.error("Error exporting PDF:", err.response?.data?.message || err.message);
    throw err;
  }
}

export default {
  getAllMeetings,
  createMeeting,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  transcribeAudio,
  transcribeText,
  exportMeetingPDF,
};