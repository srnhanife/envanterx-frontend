// src/api.js
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('auth_basic');
  if (auth) config.headers.Authorization = auth;
  return config;
});

export default api;
