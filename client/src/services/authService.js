import api, { setTokens, getTokens } from './api';
import { storage } from '../utils/storage';

export const register = (data) => api.post('/auth/register', data);

export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  const { tokens, user } = response.data.data;
  handleAuthSuccess(tokens, user);
  return response.data;
};

export const refresh = async () => {
  const { refreshToken } = getTokens();
  if (!refreshToken) throw new Error('Missing refresh token');
  const response = await api.post('/auth/refresh', { refreshToken });
  const { tokens, user } = response.data.data;
  handleAuthSuccess(tokens, user);
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  clearAuth();
};

export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.post('/auth/change-password', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const verifyEmail = (data) => api.post('/auth/verify-email', data);
export const resendVerification = () => api.post('/auth/resend-verification');

export const handleAuthSuccess = (tokens, user) => {
  setTokens({ access: tokens.access, refresh: tokens.refresh });
  storage.set('user', user);
};

export const clearAuth = () => {
  setTokens({ access: null, refresh: null });
  storage.remove('user');
};
