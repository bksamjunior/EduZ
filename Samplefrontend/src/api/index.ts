import axios from 'axios';
import { useUserStore } from '../store/user';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
