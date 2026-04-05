import api from './api';

export const getMeetings = () => api.get('/meetra/meeting/get-meetings');
export const createMeeting = (data) => api.post('/meetra/meeting/create', data);
export const getMeeting = (id) => api.get(`/meetra/meeting/get-meeting/${id}`);
export const updateMeeting = (id, data) => api.put(`/meetra/meeting/update/${id}`, data);
export const deleteMeeting = (id) => api.delete(`/meetra/meeting/delete/${id}`);
