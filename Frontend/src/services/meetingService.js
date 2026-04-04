

import api from './api';

/**
 * Get all meetings for the current user
 * @returns {Promise<Array|undefined>} Array of meetings or undefined on error
 */
export async function getAllMeetings() {
  try {
    const res = await api.get('/meeting/get-meetings');
    return res.data.meetings;
  } catch (err) {
    console.error('Error fetching meetings:', err);
    return undefined;
  }
}

/**
 * Create a new meeting
 * @param {string} title - Meeting title
 * @returns {Promise<Object|undefined>} Created meeting or undefined on error
 */
export async function createMeeting(title) {
  try {
    const res = await api.post('/meeting/create', { title });
    return res.data.meeting;
  } catch (err) {
    console.error('Error creating meeting:', err);
    return undefined;
  }
}

/**
 * Get a meeting by ID
 * @param {string} id - Meeting ID
 * @returns {Promise<Object|undefined>} Meeting object or undefined on error
 */
export async function getMeetingById(id) {
  try {
    const res = await api.get(`/meeting/get-meeting/${id}`);
    return res.data.meeting;
  } catch (err) {
    console.error('Error fetching meeting:', err);
    return undefined;
  }
}

/**
 * Update a meeting's title
 * @param {string} id - Meeting ID
 * @param {string} title - New title
 * @returns {Promise<Object|undefined>} Updated meeting or undefined on error
 */
export async function updateMeeting(id, title) {
  try {
    const res = await api.put(`/meeting/update/${id}`, { title });
    return res.data.meeting;
  } catch (err) {
    console.error('Error updating meeting:', err);
    return undefined;
  }
}

/**
 * Delete a meeting by ID
 * @param {string} id - Meeting ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
export async function deleteMeeting(id) {
  try {
    await api.delete(`/meeting/delete/${id}`);
    return true;
  } catch (err) {
    console.error('Error deleting meeting:', err);
    return false;
  }
}
