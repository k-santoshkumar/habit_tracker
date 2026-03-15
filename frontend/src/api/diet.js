import api from './index';

export const getDietSlots = () => api.get('/diet/slots');
export const createDietSlot = (data) => api.post('/diet/slots', data);
export const getDietLogs = (date) => api.get(`/diet/logs/${date}`);
export const logDietMeal = (data) => api.post('/diet/logs/meal', data);
export const logDietWater = (data) => api.post('/diet/logs/water', data);
