import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';

let accessToken = storage.get('accessToken');
let refreshToken = storage.get('refreshToken');

export const setTokens = ({ access, refresh }) => {
  accessToken = access;
  refreshToken = refresh;
  if (access) storage.set('accessToken', access);
  else storage.remove('accessToken');
  if (refresh) storage.set('refreshToken', refresh);
  else storage.remove('refreshToken');
};

export const getTokens = () => ({ accessToken, refreshToken });

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
