// src/api.js
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach Authorization header if present in localStorage.
// If stored token doesn't include a prefix, assume Bearer (common case).
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('auth_basic');
  if (auth) {
    // If token already has Bearer/Basic prefix, use as-is; otherwise prefix with Bearer
    const hasPrefix = /^Bearer |^Basic /i.test(auth);
    config.headers.Authorization = hasPrefix ? auth : `Bearer ${auth}`;
  }
  return config;
});

export default api;
