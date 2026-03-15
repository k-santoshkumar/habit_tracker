import api from './index';

export const getMoodEntries = () => api.get('/mood/entries');
export const getMoodEntry = (date) => api.get(`/mood/entries/${date}`);
export const logMood = (data) => api.post('/mood/entries', data);
export const getMoodOptions = () => api.get('/mood/options');
