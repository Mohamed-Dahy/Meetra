import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
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
      setConnections(connsRes.data.connections || []);
      setReceivedRequests(receivedRes.data.requests || []);
      setSentRequests(sentRes.data.sentRequests || sentRes.data.requests || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const sendRequest = async (userId) => {
    try {
      await connectionService.sendRequest(userId);
      await fetchAll();
      toast.success('Connection request sent');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send request');
      throw err;
    }
  };

  const acceptRequest = async (userId) => {
    try {
      await connectionService.acceptRequest(userId);
      await fetchAll();
      toast.success('Connection accepted');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to accept request');
      throw err;
    }
  };

  const rejectRequest = async (userId) => {
    try {
      await connectionService.rejectRequest(userId);
      await fetchAll();
      toast.success('Request declined');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to decline request');
      throw err;
    }
  };

  const removeConnection = async (userId) => {
    try {
      await connectionService.removeConnection(userId);
      await fetchAll();
      toast.success('Connection removed');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to remove connection');
      throw err;
    }
  };

  return {
    connections, receivedRequests, sentRequests,
    loading, error,
    sendRequest, acceptRequest, rejectRequest, removeConnection,
    fetchAll,
  };
};
