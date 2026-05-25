import api from './axiosInstance.js';

export const getSleepLogs = (params) => api.get('/sleep-logs', { params });
export const createSleepLog = (data) => api.post('/sleep-logs', data);
export const updateSleepLog = (id, data) => api.put(`/sleep-logs/${id}`, data);
export const deleteSleepLog = (id) => api.delete(`/sleep-logs/${id}`);
