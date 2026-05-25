import api from './axiosInstance.js';

export const getMeApi = () => api.get('/auth/me');
export const updateMeApi = (data) => api.patch('/auth/me', data);
