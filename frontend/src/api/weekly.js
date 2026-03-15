import api from './index';

export const getWeeklyReview = (date) => api.get(`/weekly/${date}`);
