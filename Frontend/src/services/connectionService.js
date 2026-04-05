import api from './api';

export const sendRequest = (userId) => api.post(`/connections/request/${userId}`);
export const acceptRequest = (userId) => api.put(`/connections/accept/${userId}`);
export const rejectRequest = (userId) => api.put(`/connections/reject/${userId}`);
export const removeConnection = (userId) => api.delete(`/connections/remove/${userId}`);
export const getMyConnections = () => api.get('/connections');
export const getReceivedRequests = () => api.get('/connections/requests');
export const getSentRequests = () => api.get('/connections/sent');
