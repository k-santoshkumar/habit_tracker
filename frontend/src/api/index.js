import axios from 'axios';

const isProd = import.meta.env.PROD;
const RENDER_URL = 'https://habit-tracker-vnk5.onrender.com';

const api = axios.create({
  baseURL: isProd ? `${RENDER_URL}/api` : '/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
