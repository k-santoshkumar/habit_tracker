import api from './index';

export const getHealthMetrics = () => api.get('/health/metrics');
export const createHealthMetric = (data) => api.post('/health/metrics', data);
export const getMetricEntries = (id) => api.get(`/health/entries/${id}`);
export const addMetricEntry = (data) => api.post('/health/entries', data);
