import api from './axiosInstance.js';

export const getWeightLogs = (params) => api.get('/weight-logs', { params });
export const createWeightLog = (data) => api.post('/weight-logs', data);
export const updateWeightLog = (id, data) => api.put(`/weight-logs/${id}`, data);
export const deleteWeightLog = (id) => api.delete(`/weight-logs/${id}`);
