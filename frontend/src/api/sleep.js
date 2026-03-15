import api from './index';

export const getSleepHistory = () => api.get('/sleep/history');
export const getSleepEntry = (date) => api.get(`/sleep/${date}`);
export const logSleep = (data) => api.post('/sleep/', data);
export const getSleepOptions = () => api.get('/sleep/options');
