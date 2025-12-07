import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Profiles API
export const profilesAPI = {
  getAll: () => api.get('/profiles'),
  getById: (id) => api.get(`/profiles/${id}`),
  create: (data) => api.post('/profiles', data),
  updateTimezone: (id, timezone) => api.put(`/profiles/${id}/timezone`, { timezone })
};

// Events API
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  getByProfileId: (profileId) => api.get(`/events/profile/${profileId}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data)
};

export default api;

