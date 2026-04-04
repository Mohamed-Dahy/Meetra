// hooks/useMeetings.js
import { useState, useEffect, useCallback } from 'react';
import {
  getAllMeetings,
  createMeeting as apiCreateMeeting,
  updateMeeting as apiUpdateMeeting,
  deleteMeeting as apiDeleteMeeting,
  getMeetingById,
  transcribeAudio,
  transcribeText,
  exportMeetingPDF,
} from '../services/meetingService';

/**
 * Custom React hook for managing meetings state and API calls
 * Updated to match backend: workspace support, full meeting fields, transcription & export
 */
export default function useMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMeetings();
      if (data) {
        setMeetings(data);
      } else {
        setError("Failed to load meetings");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load meetings");
      console.error("Error fetching meetings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new meeting (now requires full data including workspaceId)
   */
  const createMeeting = async (meetingData) => {
    setLoading(true);
    setError(null);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMeeting = {
      _id: tempId,
      ...meetingData,
      status: "upcoming",
      transcript: "",
      createdAt: new Date().toISOString(),
    };

    setMeetings((prev) => [optimisticMeeting, ...prev]);

    try {
      const created = await apiCreateMeeting(meetingData);
      if (created) {
        setMeetings((prev) =>
          [created, ...prev.filter((m) => m._id !== tempId)]
        );
        return created;
      } else {
        throw new Error("Failed to create meeting");
      }
    } catch (err) {
      setMeetings((prev) => prev.filter((m) => m._id !== tempId));
      const errorMsg = err.response?.data?.message || "Failed to create meeting";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update meeting (supports all fields now)
   */
  const updateMeeting = async (id, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await apiUpdateMeeting(id, updateData);
      if (updated) {
        setMeetings((prev) =>
          prev.map((m) => (m._id === id ? { ...m, ...updated } : m))
        );
        return updated;
      } else {
        throw new Error("Failed to update meeting");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update meeting";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete meeting
   */
  const deleteMeeting = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await apiDeleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete meeting";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get single meeting with full details
   */
  const fetchMeetingById = async (id) => {
    try {
      return await getMeetingById(id);
    } catch (err) {
      console.error("Error fetching meeting by ID:", err);
      throw err;
    }
  };

  /**
   * Transcribe audio for a meeting
   */
  const uploadAndTranscribe = async (meetingId, audioFile) => {
    setLoading(true);
    setError(null);
    try {
      const result = await transcribeAudio(meetingId, audioFile);
      
      // Refresh the meeting in local state
      const updatedMeeting = await fetchMeetingById(meetingId);
      if (updatedMeeting) {
        setMeetings((prev) =>
          prev.map((m) => (m._id === meetingId ? updatedMeeting : m))
        );
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to transcribe audio";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save manual transcript
   */
  const saveManualTranscript = async (meetingId, text) => {
    setLoading(true);
    setError(null);
    try {
      const result = await transcribeText(meetingId, text);
      
      // Refresh meeting
      const updatedMeeting = await fetchMeetingById(meetingId);
      if (updatedMeeting) {
        setMeetings((prev) =>
          prev.map((m) => (m._id === meetingId ? updatedMeeting : m))
        );
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save transcript";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export meeting as PDF
   */
  const exportPDF = async (meetingId) => {
    try {
      const result = await exportMeetingPDF(meetingId);
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to export PDF";
      setError(errorMsg);
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return {
    meetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    fetchMeetingById,
    uploadAndTranscribe,
    saveManualTranscript,
    exportPDF,
  };
}