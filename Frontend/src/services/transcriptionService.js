import api from './api';

export const transcribeAudio = (meetingId, audioFile) => {
  const form = new FormData();
  form.append('meetingId', meetingId);
  form.append('file', audioFile);
  return api.post('/api/transcription/audio', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const transcribeText = (meetingId, text) =>
  api.post('/api/transcription/text', { meetingId, text });

export const analyzeMeeting = (meetingId) =>
  api.post('/api/transcription/analyze', { meetingId });

export const exportPDF = (meetingId) =>
  api.post('/api/export/export-pdf', { meetingId });
