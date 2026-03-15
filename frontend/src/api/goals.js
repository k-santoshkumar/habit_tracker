import api from './index';

export const getGoals = () => api.get('/goals/');
export const createGoal = (data) => api.post('/goals/', data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);
export const getGoalCategories = () => api.get('/goals/categories');
export const updateGoalProgress = (id, value) => api.put(`/goals/${id}/progress`, { current_value: value });
export const toggleMilestone = (msId) => api.put(`/goals/milestones/${msId}/toggle`);
export const addMilestone = (goalId, title) => api.post(`/goals/${goalId}/milestones`, { title });
