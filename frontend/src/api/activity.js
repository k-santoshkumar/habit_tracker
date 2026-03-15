import api from './index';

export const getActivityTypes = () => api.get('/activity/types');
export const createActivityType = (data) => api.post('/activity/types', data);
export const getActivityLogs = (date) => api.get(`/activity/logs/${date}`);
export const logActivity = (data) => api.post('/activity/logs', data);
export const getActivitySuggestions = () => api.get('/activity/suggestions');
