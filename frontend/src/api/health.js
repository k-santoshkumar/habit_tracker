import api from './index';

export const getHealthMetrics = () => api.get('/health/metrics');
export const createHealthMetric = (data) => api.post('/health/metrics', data);
export const getMetricEntries = () => api.get(`/health/entries`);
export const addMetricEntry = (data) => api.post('/health/entries', data);
export const getHealthPresets = () => api.get('/health/presets');
