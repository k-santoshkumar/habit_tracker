import api from './index';

export const getHabits = () => api.get('/habits/');
export const createHabit = (data) => api.post('/habits/', data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);
export const getHabitLogs = (date) => api.get(`/habits/logs/${date}`);
export const logHabit = (data) => api.post('/habits/logs', data);
export const getHabitSuggestions = () => api.get('/habits/suggestions');
