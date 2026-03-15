import api from './index';

export const getPhotos = () => api.get('/photos/');
export const createPhoto = (data) => api.post('/photos/', data);
export const deletePhoto = (id) => api.delete(`/photos/${id}`);
