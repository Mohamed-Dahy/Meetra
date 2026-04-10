import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
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
      toast.success('Workspace created successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create workspace');
      throw err;
    }
  };

  const updateWorkspace = async (id, data) => {
    try {
      await workspaceService.updateWorkspace(id, data);
      await fetchWorkspaces();
      toast.success('Workspace updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update workspace');
      throw err;
    }
  };

  const deleteWorkspace = async (id) => {
    try {
      await workspaceService.deleteWorkspace(id);
      await fetchWorkspaces();
      toast.success('Workspace deleted');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete workspace');
      throw err;
    }
  };

  const inviteMember = async (workspaceId, userId) => {
    try {
      await workspaceService.inviteMember(workspaceId, userId);
      await fetchWorkspaces();
      toast.success('Member invited successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to invite member');
      throw err;
    }
  };

  const removeMember = async (workspaceId, userId) => {
    try {
      await workspaceService.removeMember(workspaceId, userId);
      await fetchWorkspaces();
      toast.success('Member removed');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to remove member');
      throw err;
    }
  };

  const leaveWorkspace = async (id) => {
    try {
      await workspaceService.leaveWorkspace(id);
      await fetchWorkspaces();
      toast.success('Left workspace');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to leave workspace');
      throw err;
    }
  };

  return {
    workspaces, loading, error,
    fetchWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace,
    inviteMember, removeMember, leaveWorkspace,
  };
};
