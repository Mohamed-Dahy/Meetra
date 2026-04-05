import api from './api';

export const getMeetings = () => api.get('/meeting/get-meetings');
export const createMeeting = (data) => api.post('/meeting/create', data);
export const getMeeting = (id) => api.get(`/meeting/get-meeting/${id}`);
export const updateMeeting = (id, data) => api.patch(`/meeting/update/${id}`, data);
export const deleteMeeting = (id) => api.delete(`/meeting/delete/${id}`);
