import { useState, useEffect, useCallback } from 'react';
import * as workspaceService from '../services/workspaceService';

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workspaceService.getMyWorkspaces();
      setWorkspaces(res.data.workspaces || res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  const createWorkspace = async (data) => {
    try {
      await workspaceService.createWorkspace(data);
      await fetchWorkspaces();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateWorkspace = async (id, data) => {
    try {
      await workspaceService.updateWorkspace(id, data);
      await fetchWorkspaces();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteWorkspace = async (id) => {
    try {
      await workspaceService.deleteWorkspace(id);
      await fetchWorkspaces();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const inviteMember = async (workspaceId, userId) => {
    try {
      await workspaceService.inviteMember(workspaceId, userId);
      await fetchWorkspaces();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const removeMember = async (workspaceId, userId) => {
    try {
      await workspaceService.removeMember(workspaceId, userId);
      await fetchWorkspaces();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const leaveWorkspace = async (id) => {
    try {
      await workspaceService.leaveWorkspace(id);
      await fetchWorkspaces();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    workspaces, loading, error,
    fetchWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace,
    inviteMember, removeMember, leaveWorkspace,
  };
};
