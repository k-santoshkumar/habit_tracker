import api from './index';

export const getPomodoroSessions = (date) => api.get(`/pomodoro/sessions/${date}`);
export const getPomodoroStats = () => api.get('/pomodoro/stats');
export const createPomodoroSession = (data) => api.post('/pomodoro/sessions', data);
