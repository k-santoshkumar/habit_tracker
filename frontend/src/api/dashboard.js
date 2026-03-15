import api from './index';

export const getScore = (date) => api.get(`/score/${date}`);
export const getStreaks = () => api.get('/streaks');
export const getHeatmap = () => api.get('/heatmap');
