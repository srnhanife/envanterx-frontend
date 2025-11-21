
import axios from 'axios';



const api = axios.create({ 
  
  baseURL: 'https://envanterx-backend-production.up.railway.app/api',
  
  headers: {
    'X-Requested-With': 'XMLHttpRequest' 
  }
});



api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('auth_basic');
  if (auth) {
    
    const hasPrefix = /^Bearer |^Basic /i.test(auth);
    config.headers.Authorization = hasPrefix ? auth : `Bearer ${auth}`;
  }
  return config;
});

export default api;