import api from './index';

export const getReflection = (date) => api.get(`/reflections/${date}`);
export const saveReflection = (data) => api.post('/reflections/', data);
