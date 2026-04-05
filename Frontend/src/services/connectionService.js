import api from './api';

export const sendRequest = (userId) => api.post(`/meetra/connections/request/${userId}`);
export const acceptRequest = (userId) => api.put(`/meetra/connections/accept/${userId}`);
export const rejectRequest = (userId) => api.put(`/meetra/connections/reject/${userId}`);
export const removeConnection = (userId) => api.delete(`/meetra/connections/remove/${userId}`);
export const getMyConnections = () => api.get('/meetra/connections');
export const getReceivedRequests = () => api.get('/meetra/connections/requests');
export const getSentRequests = () => api.get('/meetra/connections/sent');
