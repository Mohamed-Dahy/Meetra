import { useState, useEffect, useCallback } from 'react';
import * as connectionService from '../services/connectionService';

export const useConnections = () => {
  const [connections, setConnections] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [connsRes, receivedRes, sentRes] = await Promise.all([
        connectionService.getMyConnections(),
        connectionService.getReceivedRequests(),
        connectionService.getSentRequests(),
      ]);

      // ✅ safer data extraction
      setConnections(connsRes?.data?.connections || connsRes?.data || []);
      setReceivedRequests(receivedRes?.data?.requests || receivedRes?.data || []);
      setSentRequests(sentRes?.data?.requests || sentRes?.data || []);

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Actions ───────────────────────────────────────────────

  const sendRequest = async (userId) => {
    try {
      await connectionService.sendRequest(userId);
      await fetchAll(); // refresh state
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const acceptRequest = async (userId) => {
    try {
      await connectionService.acceptRequest(userId);
      await fetchAll();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const rejectRequest = async (userId) => {
    try {
      await connectionService.rejectRequest(userId);
      await fetchAll();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const removeConnection = async (userId) => {
    try {
      await connectionService.removeConnection(userId);
      await fetchAll();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    connections,
    receivedRequests,
    sentRequests,
    loading,
    error,

    // actions
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,

    // refetch
    fetchAll,
  };
};