import api from './axiosInstance.js';

export const getCalorieBurnLogs = (params) => api.get('/calorie-burn-logs', { params });
export const createCalorieBurnLog = (data) => api.post('/calorie-burn-logs', data);
export const updateCalorieBurnLog = (id, data) => api.put(`/calorie-burn-logs/${id}`, data);
export const deleteCalorieBurnLog = (id) => api.delete(`/calorie-burn-logs/${id}`);
