import api from './index';

export const getTablets = () => api.get('/tablets');
export const createTablet = (data) => api.post('/tablets', data);
export const deleteTablet = (id) => api.delete(`/tablets/${id}`);
export const getTabletLogs = (date) => api.get(`/tablets/logs/${date}`);
export const logTablet = (data) => api.post('/tablets/logs', data);
export const getTabletTimings = () => api.get('/tablets/timings');
