export const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

export const formatDate = (date, locale = 'en-US', options) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

export const formatDateTime = (date, locale = 'en-US') => {
  if (!date) return '';
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(Number(value || 0));

export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(`${key}[]`, item));
    } else {
      query.append(key, value);
    }
  });
  return query.toString();
};

export const groupBy = (items = [], key) =>
  items.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

export const percent = (partial, total) => {
  if (!total) return 0;
  return Math.round((partial / total) * 100);
};
