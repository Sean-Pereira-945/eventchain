export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
export const DEFAULT_THEME = process.env.REACT_APP_DEFAULT_THEME || 'light';

export const EVENT_FILTERS = {
  upcoming: 'upcoming',
  past: 'past',
  bookmarked: 'bookmarked',
  hosted: 'hosted'
};

export const CERTIFICATE_STATUS = {
  pending: 'pending',
  issued: 'issued',
  revoked: 'revoked'
};

export const NOTIFICATION_TYPES = {
  general: 'general',
  event: 'event',
  certificate: 'certificate',
  social: 'social'
};

export const THEMES = ['light', 'dark'];
