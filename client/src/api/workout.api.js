import api from './axiosInstance.js';

export const getWorkoutSessions = (params) => api.get('/workout-sessions', { params });
export const getWorkoutSession = (id) => api.get(`/workout-sessions/${id}`);
export const createWorkoutSession = (data) => api.post('/workout-sessions', data);
export const updateWorkoutSession = (id, data) => api.put(`/workout-sessions/${id}`, data);
export const deleteWorkoutSession = (id) => api.delete(`/workout-sessions/${id}`);
export const getStrengthProgress = (params) =>
  api.get('/workout-exercises/strength-progress', { params });
