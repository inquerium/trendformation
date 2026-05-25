import api from './axiosInstance.js';

export const getNutritionLogs = (params) => api.get('/nutrition-logs', { params });
export const createNutritionLog = (data) => api.post('/nutrition-logs', data);
export const updateNutritionLog = (id, data) => api.put(`/nutrition-logs/${id}`, data);
export const deleteNutritionLog = (id) => api.delete(`/nutrition-logs/${id}`);
