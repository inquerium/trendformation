import api from './axiosInstance.js';

export const getCaffeineLogs = (params) => api.get('/caffeine-logs', { params });
export const createCaffeineLog = (data) => api.post('/caffeine-logs', data);
export const updateCaffeineLog = (id, data) => api.put(`/caffeine-logs/${id}`, data);
export const deleteCaffeineLog = (id) => api.delete(`/caffeine-logs/${id}`);
