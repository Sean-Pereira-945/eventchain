import api from './api';

export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getEventAnalytics = (id) => api.get(`/analytics/event/${id}`);
