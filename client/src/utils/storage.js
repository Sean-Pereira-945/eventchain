const STORAGE_PREFIX = 'eventchain';

const buildKey = (key) => `${STORAGE_PREFIX}:${key}`;

export const storage = {
  get: (key, fallback = null) => {
    try {
      const value = localStorage.getItem(buildKey(key));
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  },
  set: (key, value) => {
    localStorage.setItem(buildKey(key), JSON.stringify(value));
  },
  remove: (key) => {
    localStorage.removeItem(buildKey(key));
  }
};

export const session = {
  get: (key, fallback = null) => {
    try {
      const value = sessionStorage.getItem(buildKey(key));
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  },
  set: (key, value) => {
    sessionStorage.setItem(buildKey(key), JSON.stringify(value));
  },
  remove: (key) => {
    sessionStorage.removeItem(buildKey(key));
  }
};
