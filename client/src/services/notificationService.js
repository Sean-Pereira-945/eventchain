import api from './api';

export const getNotifications = () => api.get('/notifications');
export const markAsRead = (ids) => api.post('/notifications/read', { ids });
