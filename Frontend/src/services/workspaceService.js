import api from './api';

// ─── Workspace CRUD ──────────────────────────────────────────
export const getMyWorkspaces = () => api.get('/meetra/get-workspaces');

export const createWorkspace = (data) =>
  api.post('/meetra/create-workspace', data);

export const getWorkspaceById = (id) =>
  api.get(`/meetra/get-workspace/${id}`);

export const updateWorkspace = (id, data) =>
  api.put(`/meetra/update-workspace/${id}`, data);

export const deleteWorkspace = (id) =>
  api.delete(`/meetra/delete-workspace/${id}`);


// ─── Members Management ──────────────────────────────────────
export const inviteMember = (workspaceId, userId) =>
  api.post(`/meetra/invite-member/${workspaceId}`, { userId });

export const removeMember = (workspaceId, userId) =>
  api.delete(`/meetra/remove-member/${workspaceId}/${userId}`);

export const leaveWorkspace = (id) =>
  api.post(`/meetra/leave-workspace/${id}`);

export const getWorkspaceMembers = (id) =>
  api.get(`/meetra/get-members/${id}`);