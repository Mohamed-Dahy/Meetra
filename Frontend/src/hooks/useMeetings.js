// hooks/useMeetings.js
import { useState, useEffect, useCallback } from 'react';
import {
  getAllMeetings,
  createMeeting as apiCreateMeeting,
  updateMeeting as apiUpdateMeeting,
  deleteMeeting as apiDeleteMeeting,
} from '../services/meetingService';

/**
 * Custom React hook for managing meetings state and API calls
 * @returns {{
 *   meetings: Array,
 *   loading: boolean,
 *   error: string|null,
 *   fetchMeetings: Function,
 *   createMeeting: Function,
 *   updateMeeting: Function,
 *   deleteMeeting: Function
 * }}
 */
export default function useMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await getAllMeetings();
    if (data) {
      setMeetings(data);
    } else {
      setError('Failed to load meetings');
    }
    setLoading(false);
  }, []);

  const createMeeting = async (title) => {
    setLoading(true);
    setError(null);
    // Optimistic update
    const tempId = 'temp-' + Date.now();
    const optimistic = { _id: tempId, title, status: 'pending', date: new Date().toISOString() };
    setMeetings((prev) => [optimistic, ...prev]);
    const created = await apiCreateMeeting(title);
    if (created) {
      setMeetings((prev) => [created, ...prev.filter((m) => m._id !== tempId)]);
    } else {
      setMeetings((prev) => prev.filter((m) => m._id !== tempId));
      setError('Failed to create meeting');
    }
    setLoading(false);
  };

  const updateMeeting = async (id, title) => {
    setLoading(true);
    setError(null);
    const updated = await apiUpdateMeeting(id, title);
    if (updated) {
      setMeetings((prev) => prev.map((m) => (m._id === id ? { ...m, ...updated } : m)));
    } else {
      setError('Failed to update meeting');
    }
    setLoading(false);
  };

  const deleteMeeting = async (id) => {
    setLoading(true);
    setError(null);
    const ok = await apiDeleteMeeting(id);
    if (ok) {
      setMeetings((prev) => prev.filter((m) => m._id !== id));
    } else {
      setError('Failed to delete meeting');
    }
    setLoading(false);
  };

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
  };
}
