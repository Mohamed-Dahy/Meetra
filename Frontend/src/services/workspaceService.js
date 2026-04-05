import api from './api';

// ─── Workspace CRUD ──────────────────────────────────────────
export const getMyWorkspaces = () => api.get('/workspaces/get-workspaces');

export const createWorkspace = (data) =>
  api.post('/workspaces/create-workspace', data);

export const getWorkspaceById = (id) =>
  api.get(`/workspaces/get-workspace/${id}`);

export const updateWorkspace = (id, data) =>
  api.put(`/workspaces/update-workspace/${id}`, data);

export const deleteWorkspace = (id) =>
  api.delete(`/workspaces/delete-workspace/${id}`);


// ─── Members Management ──────────────────────────────────────
export const inviteMember = (workspaceId, userId) =>
  api.post(`/workspaces/invite-member/${workspaceId}`, { userId });

export const removeMember = (workspaceId, userId) =>
  api.delete(`/workspaces/remove-member/${workspaceId}/${userId}`);

export const leaveWorkspace = (id) =>
  api.post(`/workspaces/leave-workspace/${id}`);

export const getWorkspaceMembers = (id) =>
  api.get(`/workspaces/get-members/${id}`);