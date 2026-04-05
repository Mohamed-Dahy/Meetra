import { useState, useEffect, useCallback } from 'react';
import * as meetingService from '../services/meetingService';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await meetingService.getMeetings();
      setMeetings(res.data.meetings || res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const createMeeting = async (data) => {
    try {
      await meetingService.createMeeting(data);
      await fetchMeetings();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateMeeting = async (id, data) => {
    try {
      await meetingService.updateMeeting(id, data);
      await fetchMeetings();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteMeeting = async (id) => {
    try {
      await meetingService.deleteMeeting(id);
      await fetchMeetings();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { meetings, loading, error, fetchMeetings, createMeeting, updateMeeting, deleteMeeting };
};
