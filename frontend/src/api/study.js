import api from './index';

export const getStudyTracks = () => api.get('/study/tracks');
export const createStudyTrack = (data) => api.post('/study/tracks', data);
export const createStudyTopic = (data) => api.post('/study/topics', data);
export const updateTopicStatus = (id, status) => api.put(`/study/topics/${id}/status`, null, { params: { status } });
