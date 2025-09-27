import api from './api';
import { buildQueryString } from '../utils/helpers';

export const getEvents = (filters = {}) => {
  const query = buildQueryString(filters);
  return api.get(`/events${query ? `?${query}` : ''}`);
};

export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (payload) => api.post('/events', payload);
export const updateEvent = (id, payload) => api.put(`/events/${id}`, payload);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const registerForEvent = (id) => api.post(`/events/${id}/register`);
export const markAttendance = (id, location) => api.post(`/events/${id}/attend`, location);
export const getAnalytics = (id) => api.get(`/analytics/events/${id}`);
export const getAllAnalytics = (params = {}) => api.get('/analytics/events', { params });
